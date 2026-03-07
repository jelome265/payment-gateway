provider "aws" {
  region = "af-south-1" # Cape Town
}

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true

  tags = {
    Name = "warmheart-vpc"
  }
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
  availability_zone = "af-south-1a"

  tags = {
    Name = "warmheart-public-a"
  }
}
