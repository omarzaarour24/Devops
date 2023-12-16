#!/bin/bash

DATABASE="postgresql://user:pass@db/db"
USER="user"
PASSWORD="pass"
TABLE="names"
FILE="data.txt"

row_count=$(PGPASSWORD=$PASSWORD psql -h $HOST -U $USER -d $DATABASE -t -c "SELECT COUNT(*) FROM $TABLE;")
row_count=$(echo $row_count | xargs) 
if [ "$row_count" -eq "0" ]; then

    while IFS= read -r line
    do
        
        if [[ $line == "person[" ]]; then
            #reads the lines containing the name and email 
            read -r name_line
            read -r email_line
            read -r shortname_line

            # Extract the name
            name=$(echo "$name_line" | grep -oP '(?<=name{").*?(?="})')
            # Extract the email
            email=$(echo "$email_line" | grep -oP '(?<=email{").*?(?="})')
            # Extract the shortname
            code=$(echo "$shortname_line" | grep -oP '(?<=code{").*?(?="})')

            PGPASSWORD=$PASSWORD psql -U $USER -d $DATABASE -c "INSERT INTO $TABLE (fullname, email, shortname) VALUES ('$name', '$email', '$code');"
        fi

    done < "$FILE"
else
    echo "Database is already populated"
fi


# we used the following article to get the sytax of the POST req with cURL https://www.warp.dev/terminus/curl-post-request
#and this to figure out how to read each line of the data.txt file https://www.cyberciti.biz/faq/unix-howto-read-line-by-line-from-file/
#and in order to extract only what we need for the name, email and shortname we used a lot of online information https://superuser.com/questions/608334/what-is-the-difference-between-these-two-grep-options
#https://unix.stackexchange.com/questions/513090/understanding-grep-op-in-a-script
#After understanding how to read each line we started extracting the specific data that we needed,
#this data was hard to get more specifically how to do the specific grep to only get value that we wanted, this was a long process of trial error.


#in order to add the data to the database we defined the connection details and started the connection with the db using the psql to run the postgres interactive terminal
#after that connection is successful we run a command to count the number of rows from the only table that is created in the db.
#If the row is empty it will run the same if that was done by the first assignment and then it uses again the psql command to add the data to the table in the db.
#to check if the database is empty https://stackoverflow.com/questions/7093805/shell-script-and-sql-results