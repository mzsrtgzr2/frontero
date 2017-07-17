clean:
	# Stop and Delete Containers
	docker stop $(docker ps -a -q)
	docker rm $(docker ps -a -q)
	
build: 
	docker build -t frontero_cloud_base -f ./Dockerfile-cloud-base .
	docker build -t frontero_web -f ./Dockerfile-web .
	docker-compose build
	docker build -t frontero_zombie -f ./Dockerfile-zombie .

run:
	docker-compose up

run-infra:
	docker-compose -f docker-compose.infra.only.yml up

danger-erase-all-images:
	# Delete all containers
	docker rm $(docker ps -a -q)
	# Delete all images
	docker rmi $(docker images -q)


