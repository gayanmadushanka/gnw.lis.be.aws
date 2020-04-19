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