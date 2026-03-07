terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    vault = {
      source  = "hashicorp/vault"
      version = "~> 3.21"
    }
  }
}

provider "aws" {
  region = var.aws_region
}
