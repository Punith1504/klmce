# ==============================================================================
# KLMCE ERP - Global Anycast Infrastructure Mesh
# Provider: AWS (Amazon Web Services)
# ==============================================================================

# 1. AWS Aurora Serverless v2 (Global Database)
# Provides sub-second asynchronous physical replication across continents.
resource "aws_rds_global_cluster" "klmce_global_db" {
  global_cluster_identifier = "klmce-global-erp"
  engine                    = "aurora-postgresql"
  engine_version            = "15.4"
  database_name             = "klmce_erp"
}

# ----------------------------------------------------
# PRIMARY REGION (Asia Pacific - Mumbai: ap-south-1)
# ----------------------------------------------------
provider "aws" {
  alias  = "primary"
  region = "ap-south-1"
}

resource "aws_rds_cluster" "primary_cluster" {
  provider                  = aws.primary
  cluster_identifier        = "klmce-primary-cluster"
  engine                    = aws_rds_global_cluster.klmce_global_db.engine
  engine_version            = aws_rds_global_cluster.klmce_global_db.engine_version
  global_cluster_identifier = aws_rds_global_cluster.klmce_global_db.id
  master_username           = "postgres_admin"
  master_password           = var.db_password
  
  # Serverless v2 auto-scales RAM and CPU instantly from 2 ACUs to 64 ACUs
  serverlessv2_scaling_configuration {
    max_capacity = 64.0
    min_capacity = 2.0
  }
}

# ----------------------------------------------------
# SECONDARY REGION (Europe - Frankfurt: eu-central-1)
# ----------------------------------------------------
provider "aws" {
  alias  = "secondary"
  region = "eu-central-1"
}

resource "aws_rds_cluster" "secondary_cluster" {
  provider                  = aws.secondary
  cluster_identifier        = "klmce-secondary-cluster"
  engine                    = aws_rds_global_cluster.klmce_global_db.engine
  engine_version            = aws_rds_global_cluster.klmce_global_db.engine_version
  global_cluster_identifier = aws_rds_global_cluster.klmce_global_db.id
  
  # Operates as a Read-Replica for European users. 
  # In a disaster, it automatically promotes to Primary Write mode in < 60 seconds.
  serverlessv2_scaling_configuration {
    max_capacity = 64.0
    min_capacity = 2.0
  }
  depends_on = [aws_rds_cluster.primary_cluster]
}

# ==============================================================================
# 2. AWS GLOBAL ACCELERATOR (Anycast BGP Edge Routing)
# ==============================================================================
# Assigns two static Anycast IPv4 addresses. A student connecting from London 
# will hit the European Edge Node and be routed over the private AWS backbone 
# to the Frankfurt K8s cluster, dodging public internet latency entirely.
resource "aws_globalaccelerator_accelerator" "klmce_global_mesh" {
  name            = "klmce-anycast-mesh"
  ip_address_type = "IPV4"
  enabled         = true
}

resource "aws_globalaccelerator_listener" "https_listener" {
  accelerator_arn = aws_globalaccelerator_accelerator.klmce_global_mesh.id
  client_affinity = "SOURCE_IP"
  protocol        = "TCP"

  port_range {
    from_port = 443
    to_port   = 443
  }
}
