angular.module('resturant.robot').controller('ResturantController', function ($scope,$interval) {
	$scope.tables = [
	{'occupied':false,'disabled':false,'status':'empty'},
	{'occupied':false,'disabled':false,'status':'empty'},
	{'occupied':false,'disabled':false,'status':'empty'},
	{'occupied':false,'disabled':false,'status':'empty'},
	{'occupied':false,'disabled':false,'status':'empty'},
	{'occupied':false,'disabled':false,'status':'empty'}
	];

	var debug = false;
	$interval(doWorkSon,1000);

	var promise = $interval(randomSim,15000);

	$scope.food = ["Pepperoni Pizza", "Fried Chicken", "Alfredo Pasta", "Triple Cheeseburger", "Ice Cream"];
	$scope.drinks = ["Coca-Cola", "Water", "Tea", "Sprite", "Milkshake"];
	$scope.orders = [];
	$scope.message = 'Idle';
	$scope.intervals = [{'name':'Busy','interval':5000},{'name':'Moderate','interval':10000},{'name':'Slow','interval':15000}];
	$scope.currentInterval = 5000;

	$scope.occupy = function(id) {
		$scope.tables[id].occupied = true;
		$scope.tables[id].status = 'occupied';
		$scope.tables[id].bill = 0;
		$scope.orders.push({'message':'Greet table '+(id+1),'id':id,type:'occupy'});
	};

	$scope.orderFood = function(id){
		var foodItem = $scope.food[Math.floor(Math.random()* $scope.food.length)];
		$scope.orders.push({'message':"Give " + foodItem  + " for table " + (id + 1),'id':id,'type':'orderFood', 'give': 'true', 'item':foodItem });
		$scope.tables[id].bill += Math.floor((Math.random() * 20) + 7);
	}

	$scope.orderDrink = function(id){
		var foodItem = $scope.drinks[Math.floor(Math.random()* $scope.drinks.length)];
		$scope.orders.push({'message':"Get " + foodItem + " for table " + (id + 1),'id':id,type:'orderDrink', give: 'true', item: foodItem  });
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
					
					
					if(order.type == 'orderFood' && order.give == 'true'){
						jQuery('.robot').append("<img src='img/fullPlate.png' id='fullPlate' />");
					}else if(order.type == 'orderDrink' && order.give == 'true'){
						jQuery('.robot').append("<img src='img/fullCup.png' id='fullCup' />");
					}
					jQuery('.robot').animate({top:'400px',left:$('#table'+(order.id+1)).position().left},1500);
					jQuery('.robot').animate({top:$('#table'+(order.id+1)).position().top,left:$('#table'+(order.id+1)).position().left},1500, function(){
						if((order.type == 'orderFood' || order.type == 'orderDrink') && order.give == 'true'){
							if(debug) alert('remove plate');
							jQuery('img:last-child', this).remove();
						}
						if(order.type == 'orderFood' && order.give == 'false'){
							jQuery('.robot').append("<img src='img/emptyPlate.png' id='emptyPlate' />");
						}else if(order.type == 'orderDrink' && order.give == 'false'){
							jQuery('.robot').append("<img src='img/emptyCup.png' id='emptyCup' />");
						}
					});
					jQuery('.robot').animate({top:'400px',left:$('#table'+(order.id+1)).position().left},1500);
					jQuery('.robot').animate({top:'400px',left:'250px'},1500,function(){
						
						if((order.type == 'orderFood' || order.type == "orderDrink") && order.give == 'false'){
							jQuery('img:last-child', this).remove();
						}
						
						$scope.status.processing = false;
						if(order.type=='payCheck'){
							$scope.tables[order.id].disabled = false;
							$scope.tables[order.id].status = 'empty';
						}
						$scope.message = 'Idle';
					});
					
					
					//This is to see once the food has been delivered then it will countdown a time for user to eat then to pick up empty plate.
					if(order.type == "orderFood"){
						if(debug) alert('orderFood '+order.item);
						if(order.give == 'true'){
							if(debug)alert('give true');
							setTimeout(function(){
								$scope.orders.push({'message':"Get " + order.item + " for table " + (order.id + 1),'id':order.id,type:'orderFood', give:'false', item:order.item  });
							}, 3000);
						}
					}else if(order.type == "orderDrink"){
						if(debug)alert('orderDrink '+order.item);
						if(order.give == 'true'){
							setTimeout(function(){
								$scope.orders.push({'message':"Get " + order.item + " for table " + (order.id + 1),'id':order.id,type:'orderDrink', give:'false', item:order.item  });
							}, 3000);
						}
					}
				}
				$scope.status.isWorking = false;
			}

		}
	}
});
