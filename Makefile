DEPLOYMENT_BUCKET=gnw-lis-dev
REGION=ap-south-1
STACK_PREFIX=$(USER)
API_STACK_NAME=$(STACK_PREFIX)-gnw-lis-api

AWS_TOOLS_AWS=aws
AWS_TOOLS_SAM=$(AWS_TOOLS) sam

setup:
	@mkdir -p .sam

api-up: setup 
	$(AWS_TOOLS_SAM) package --template-file stack-api.yaml --output-template-file ./.sam/stack-api-packaged.yaml --s3-bucket $(DEPLOYMENT_BUCKET)
	$(AWS_TOOLS_SAM) deploy --template-file ./.sam/stack-api-packaged.yaml --stack-name $(API_STACK_NAME) --capabilities CAPABILITY_IAM --region $(REGION) --no-fail-on-empty-changeset  

api-down: setup clear-source-bucket
	$(AWS_TOOLS_AWS) cloudformation delete-stack --stack-name $(API_STACK_NAME)  --region $(REGION) 
	
env-up: create-dev-bucket api-up update-source-bucket 

env-down: api-down delete-dev-bucket

update-source-bucket:
	$(AWS_TOOLS_AWS) s3 cp templates/tag-example.docx s3://$(API_STACK_NAME)-source/tag-example.docx

clear-source-bucket:
	$(AWS_TOOLS_AWS) s3 rm s3://$(API_STACK_NAME)-source --recursive

create-dev-bucket:
	$(AWS_TOOLS_AWS) s3 mb s3://$(DEPLOYMENT_BUCKET)

delete-dev-bucket:
	$(AWS_TOOLS_AWS) s3 rm s3://$(DEPLOYMENT_BUCKET) --recursive
	$(AWS_TOOLS_AWS) s3 rb s3://$(DEPLOYMENT_BUCKET)