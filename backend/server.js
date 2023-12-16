const dotenv = require('dotenv');
dotenv.config();
const {Sequelize, Op} = require('sequelize');
const express = require('express');
const cors = require('cors');
const os = require('os');

// Read environment settings
const PORT = process.env.EXPRESS_PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'testing';

// Setup Express
const app = express();
app.use(cors());
app.use(express.json());

// Available enviroments:
// - Production: uses PostgreSQL
// - Development: uses an empty SQLite database that is stored on disk (namesdb.sqlite)
// - Testing: uses an in-memory SQLite database and adds a couple of names to the table for testing purposes
// Default settings for development
let sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'namesdb.sqlite',
});

// In case of production enviroment, use the postgres database
if (NODE_ENV === 'production') {
  sequelize = new Sequelize(`postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`);
} else if (NODE_ENV === 'testing') {
  sequelize = new Sequelize('sqlite::memory:');
}

// Create database model
const ShortName = sequelize.define('name', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  shortname: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  fullname: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
},
{
  timestamps: false,
},
);

// Now we define the available REST routes
app.get('/', async (req, res) => {
  const queryResult = await ShortName.findAll({
    raw: true,
  });
  res.json(queryResult);
});

app.get('/status', async (req, res) => {
  const queryResult = await ShortName.findAll({
    raw: true,
  });
  res.json({'hostname': os.hostname(), 'message': 'Succesfully connected to the backend.', 'contacts': queryResult});
});

app.get('/search', async (req, res) => {
  if (req.query.shortname) {
    const queryResult = await ShortName.findAll({
      where: {
        shortname: {
          [Op.like]: `%${req.query.shortname}%`,
        },
      },
      raw: true,
    });
    res.json(queryResult);
  } else {
    res.status(400).json({'error': 'Query parameter `shortname` missing.'});
  }
});

app.post('/', async (req, res) => {
  if (req.body && req.body.fullname && req.body.email && req.body.shortname) {
    try {
      await ShortName.create({
        shortname: req.body.shortname,
        fullname: req.body.fullname,
        email: req.body.email,
      });
      res.status(201).end();
    } catch (error) {
      console.error(error);
      res.status(400).json({'error': 'Could not add person to database. Database error occured.'});
    }
  } else {
    res.status(400).json({'error': 'Invalid record received. Can not add the user.'});
  }
});

/**
 * Setup the database connection and start the webserver.
 */
async function startApplication() {
  console.log(`Running application in '${NODE_ENV}' mode.`);

  try {
    // Connect to database and create table (if not exist)
    await sequelize.authenticate();
    await ShortName.sync();

    // Add some sample data if we are in testing mode
    if (NODE_ENV === 'testing') {
      await ShortName.create({shortname: 'jja01', fullname: 'Jan Jansen', email: 'j.jansen@test.saxion.nl'});
      await ShortName.create({shortname: 'ppe01', fullname: 'Peter Peters', email: 'p.peters@test.saxion.nl'});
    }

    // Start the webserver
    app.listen(PORT, () => {
      console.log(`SNS backend listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database error occured: ', error);
  }
}

startApplication();
