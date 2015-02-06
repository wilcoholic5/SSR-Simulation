angular.module('resturant.robot').controller('ResturantController', function ($scope,$interval) {
	$scope.tables = [
	{'occupied':false,'disabled':false,'status':'empty'},
	{'occupied':false,'disabled':false,'status':'empty'},
	{'occupied':false,'disabled':false,'status':'empty'},
	{'occupied':false,'disabled':false,'status':'empty'},
	{'occupied':false,'disabled':false,'status':'empty'},
	{'occupied':false,'disabled':false,'status':'empty'}
	];


	$interval(doWorkSon,1000);

	var promise = $interval(randomSim,5000);

	$scope.food = ["Pepperoni Pizza", "Fried Chicken", "Alfredo Pasta", "Triple Cheeseburger", "Ice Cream"];
	$scope.drinks = ["Coca-Cola", "Water", "Tea", "Sprite", "Milkshake"];
	$scope.orders = [];
	$scope.message = 'Idle';
	$scope.intervals = [{'name':'Busy','interval':500},{'name':'Moderate','interval':1000},{'name':'Slow','interval':5000}];
	$scope.currentInterval = 5000;

	$scope.occupy = function(id) {
		$scope.tables[id].occupied = true;
		$scope.tables[id].status = 'occupied';
		$scope.tables[id].bill = 0;
		$scope.orders.push({'message':'Greet table '+(id+1),'id':id,type:'occupy'});
	};

	$scope.orderFood = function(id){
		$scope.orders.push({'message':"Get " + $scope.food[Math.floor(Math.random()* $scope.food.length)] + " for table " + (id + 1),'id':id,type:'orderFood' });
		$scope.tables[id].bill += Math.floor((Math.random() * 20) + 7);
	}

	$scope.orderDrink = function(id){
		$scope.orders.push({'message':"Get " + $scope.drinks[Math.floor(Math.random()* $scope.drinks.length)] + " for table " + (id + 1),'id':id,type:'orderDrink' });
		$scope.tables[id].bill += Math.floor((Math.random() * 3) + 1);
	}


	$scope.paybill = function(id){
		$scope.tables[id].bill = 0;
		$scope.tables[id].occupied = false;
		$scope.tables[id].disabled = true;
		$scope.tables[id].status = 'pending';
		$scope.orders.push({'message':"Grab check from table " + (id + 1),'id':id,type:'payCheck' });
	}

	$scope.updateInterval = function(){
		$interval.cancel(promise);
		promise = $interval(randomSim,$scope.currentInterval);
	}

	$scope.status = {
		isWorking:false,
		processing:false
	};

	function randomSim(){
		var id = Math.floor((Math.random() * 6));
		var setOrder = false;

		console.log("Trying to set order for " + (id+1));
		var status = $scope.tables[id].status;
		if(status=='empty'){
			$scope.occupy(id);
			setOrder = true;
		}else if(status=='occupied'){
			if($scope.tables[id].bill > 0){
				var choice = Math.floor((Math.random() * 3) + 1);
				if(choice==1){
					$scope.orderFood(id);
					setOrder = true;
				}else if(choice==2){
					$scope.orderDrink(id);
					setOrder = true;
				}else{
					$scope.paybill(id);
					setOrder = true;
				}
			}else{
				var choice = Math.floor((Math.random() * 2) + 1);
				if(choice==1){
					$scope.orderFood(id);
					setOrder = true;
				}else{
					$scope.orderDrink(id);
					setOrder = true;
				}
			}
		}else{
			var id = Math.floor((Math.random() * 6));
		}
	}

	function doWorkSon(){
		if(!$scope.status.isWorking){
			if($scope.orders.length>0){
				$scope.status.isWorking = true;
				while($scope.orders.length>0){
					if($scope.status.processing){
						break;
					}
					var order = $scope.orders.shift();
					$scope.status.processing = true;
					$scope.message = order.message;
					jQuery('.robot').animate({top:$('#table'+(order.id+1)).position().top,left:$('#table'+(order.id+1)).position().left},1500);

					jQuery('.robot').animate({top:'400px',left:'250px'},1500,function(){
						$scope.status.processing = false;
						if(order.type=='payCheck'){
							$scope.tables[order.id].disabled = false;
							$scope.tables[order.id].status = 'empty';
						}
						$scope.message = 'Idle';
					});
				}
				$scope.status.isWorking = false;
			}

		}
	}
});
