provider "aws" {
  region = "us-east-1"
}
resource "aws_vpc" "exam_vpc" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "retakeExam"
  }
}

resource "aws_internet_gateway" "internetGate" {
  vpc_id = aws_vpc.exam_vpc.id
  tags = {
    Name = "internet Gateway"
  }
}

resource "aws_route_table" "Exam_route_table" {
  vpc_id = aws_vpc.exam_vpc.id
  tags = {
    Name = "MyRouteTable"
  }
}

resource "aws_route" "ExamRoute" {
  route_table_id         = aws_route_table.Exam_route_table.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.internetGate.id
}

resource "aws_route_table_association" "ExamAssociation" {
  for_each        = var.subnets
  subnet_id       = aws_subnet.my_subnet[each.key].id
  route_table_id = aws_route_table.Exam_route_table.id
}

resource "aws_subnet" "my_subnet" {
  for_each          = var.subnets
  vpc_id             = aws_vpc.exam_vpc.id
  cidr_block         = each.value.cidr_block
  availability_zone = each.value.availability_zone
  tags = {
    Name = "terraform subnet ${each.key}"
  }
}

resource "aws_instance" "SubnetInstance1" {
  ami                         = "ami-053b0d53c279acc90"
  instance_type               = "t2.micro"
  subnet_id                   = aws_subnet.my_subnet["subnet1"].id
  key_name                    = "kkey"
  associate_public_ip_address = true
  vpc_security_group_ids      = [aws_security_group.ExamSecurityGroup.id]
  tags = {
    Name = "Ubuntu 1"
  }
}

resource "aws_instance" "SubnetInstance2" {
  ami                         = "ami-053b0d53c279acc90"
  instance_type               = "t2.micro"
  subnet_id                   = aws_subnet.my_subnet["subnet2"].id
  key_name                    = "kkey"
  associate_public_ip_address = true
  vpc_security_group_ids      = [aws_security_group.ExamSecurityGroup.id]
  tags = {
    Name = "Ubuntu 2"
  }
}

resource "aws_security_group" "ExamSecurityGroup" {
  name        = "ExamSecurityGroup"
  description = "security group for the ec2 instances"
  vpc_id      = aws_vpc.exam_vpc.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "Exam security Group"
  }
}
resource "aws_s3_bucket" "frontendstatic" {
  bucket = "bucketforstaticsite"
  website {
      index_document = "frontend/index.html"
  }
  tags = {
    Name = "examStaticWebsiteBucket"
  }
}
resource "aws_s3_bucket_ownership_controls" "frontendstatic" {
  bucket = aws_s3_bucket.frontendstatic.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "frontendstatic" {
  bucket = aws_s3_bucket.frontendstatic.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_acl" "frontendstatic" {
  depends_on = [
    aws_s3_bucket_ownership_controls.frontendstatic,
    aws_s3_bucket_public_access_block.frontendstatic,
  ]

  bucket = aws_s3_bucket.frontendstatic.id
  acl    = "public-read"
}
#bucket created by adapting the example here: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_acl
#used aws s3 sync . s3://bucketforretake/ to upload the frontend files to the bucket


resource "aws_lb" "ExamLoadBalancer" {
  name = "Exam-Load-Balancer"
  load_balancer_type = "application"
  subnets= [
    aws_subnet.my_subnet["subnet1"].id,
    aws_subnet.my_subnet["subnet2"].id
  ]
  security_groups = [aws_security_group.ExamSecurityGroup.id]
  tags = {
    Name = "Exam-Load-Balancer"
  }
}