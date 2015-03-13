angular.module('resturant.robot').controller('ResturantController', function ($scope,$rootScope,$interval,$timeout,$modal) {
	$scope.conn = new WebSocket("ws://localhost:8080");
	$scope.conn.onopen = function(e) {
		console.log("connected to the database");
	};
	$scope.tables = [
	{'occupied':false,'disabled':false,'status':'empty','visit':{},'foodPending':0},
	{'occupied':false,'disabled':false,'status':'empty','visit':{},'foodPending':0},
	{'occupied':false,'disabled':false,'status':'empty','visit':{},'foodPending':0},
	{'occupied':false,'disabled':false,'status':'empty','visit':{},'foodPending':0},
	{'occupied':false,'disabled':false,'status':'empty','visit':{},'foodPending':0},
	{'occupied':false,'disabled':false,'status':'empty','visit':{},'foodPending':0}
	];

	$scope.visits = [];

	var debug = false;
	$scope.playSounds = true;
	$interval(doWorkSon,1000);
	var cash = document.getElementById('cash');
	var promise = $interval(randomSim,2500);

	$scope.tableID = ["#table1", "#table2", "#table3", "#table4", "#table5", "#table6"];

	$scope.food = [{name:"Pepperoni Pizza",price:10}, {name:"Fried Chicken",price:12}, {name:"Alfredo Pasta",price:15}, {name:"Triple Cheeseburger",price:11}, {name:"Ice Cream",price:7}];
	$scope.drinks = [{name:"Coca-Cola",price:3}, {name:"Water",price:0}, {name:"Tea",price:3}, {name:"Sprite",price:3}, {name:"Milkshake",price:4}];
	$scope.orders = [];
	$scope.kitchenQueue = [];
	$scope.message = 'Idle';
	$scope.intervals = [{'name':'Busy','interval':2500},{'name':'Moderate','interval':4500},{'name':'Slow','interval':8000}];
	$scope.currentInterval = 2500;
	$scope.promises = [];
	$scope.eatingInterval = 2500;
	$scope.animationInterval = 1000;

	$scope.occupy = function(id) {
		$scope.tables[id].visit = {"table":id+1,"orders":{'foods':[],"drinks":[]},"bill":0};
		$scope.tables[id].occupied = true;
		$scope.tables[id].status = 'occupied';
		$scope.tables[id].bill = 0;
		$scope.orders.push({'message':"Greet table "+(id+1) + "",'id':id,type:'occupy', command:'Greet', table:(id+1)});
		$rootScope.$broadcast('orderAdded');
	};

	$scope.orderFood = function(id,foodID){
		if(foodID){
			var foodItem = $scope.food[foodID];
		}else{
			var foodItem = $scope.food[Math.floor(Math.random()* $scope.food.length)];
		}
		var price =foodItem.price
		$scope.tables[id].bill += price;
		$scope.tables[id].visit.bill += price;
		$scope.tables[id].foodPending++;
		$scope.tables[id].disabled = true;
		$rootScope.$broadcast('payUpdate',{'canPay':$scope.tables[id].disabled,'tableid':id});
		$rootScope.$broadcast('billUpdate',{'bill':$scope.tables[id].bill,'tableid':id});
		$rootScope.$broadcast('addFood',{'command':'Give Food','item':foodItem.name,'price':foodItem.price,'id':id,'type':'orderFood','give':'true','message':"Give " + foodItem.name  + " for table " + (id + 1)});
	}

	$scope.$on('payBill',function(event,args){
		$scope.paybill(args.tableid);
	});

	$scope.$on('addFood',function(event,args){
		var curTime = 0;
		var id = addfood({'item':args.item,'time':0,'id':args.id + 1,'status':'danger'});
		var order = args;
		var randomTime = Math.floor((Math.random() * 400) + 50);

		$scope.promises[id] = $interval(function(){
			if(curTime>50){
				$scope.kitchenQueue[id].status = 'warning';
			}

			if(curTime>85){
				$scope.kitchenQueue[id].status = 'success';
			}

			if(curTime==100){
				$scope.orders.push(order);
				$rootScope.$broadcast('orderAdded');
				$scope.tables[args.id].visit.orders.foods.push({"name":order.item,"price":order.price});
				$scope.tables[args.id].foodPending--;
				removeFood(id);
				if($scope.tables[args.id].foodPending == 0){
					$scope.tables[args.id].disabled = false;
				}
				$interval.cancel($scope.promises[id]);
			}else{
				curTime++;
				$scope.kitchenQueue[id].timeleft = curTime;
			}
		},randomTime);

	});

	$scope.orderDrink = function(id,foodID){
		if(foodID){
			var foodItem = $scope.drinks[foodID];
		}else{
			var foodItem = $scope.drinks[Math.floor(Math.random()* $scope.drinks.length)];
		}
		$scope.tables[id].visit.orders.drinks.push({"name":foodItem.name,"price":foodItem.price});
		$scope.orders.push({'message':"Get " + foodItem.name + " for table " + (id + 1)+ "",'id':id,type:'orderDrink', give: 'true', item: foodItem.name, command:'Give Drink', table:(id+1)  });
		$rootScope.$broadcast('orderAdded');
		var price = foodItem.price
		$scope.tables[id].bill += price;
		$rootScope.$broadcast('billUpdate',{'bill':$scope.tables[id].bill,'tableid':id});
		$scope.tables[id].visit.bill += price;
	}


	$scope.paybill = function(id){
		$scope.tables[id].bill = 0;
		$scope.tables[id].occupied = false;
		$scope.tables[id].disabled = true;
		$scope.tables[id].status = 'pending';
		$scope.orders.push({'message':"Grab check from table " + (id + 1) + "",'id':id,type:'payCheck', command: 'Grab Check', item:"check", table:(id+1) });
		$rootScope.$broadcast('orderAdded');
	}

	$scope.updateInterval = function(){
		$interval.cancel(promise);
		promise = $interval(randomSim,$scope.currentInterval);
	}

	$scope.stressTest = function(){
		$scope.animationInterval = 500;
		$interval.cancel(promise);
		promise = $interval(randomSim,500);
	}

	$scope.open = function (size,tableid) {
	    var modalInstance = $modal.open({
	      templateUrl: 'myModalContent.html',
	      controller: 'ModalInstanceCtrl',
	      size: size,
	      resolve: {
	        foods: function () {
	         	return $scope.food;
	        },
	        drinks: function(){
	        	return $scope.drinks;
	        },
	        tableid :function(){
	        	return tableid;
	        }, 
	        bill:function(){
	        	return $scope.tables[tableid].bill;
	        },
	        disabled:function(){
	        	return $scope.tables[tableid].disabled;
	        }
	      }
    	});

    	modalInstance.result.then(function(orders){
    		//Put in drink orders first
    		for(key in orders.drinks){
    			for (var i = 0; i < orders.drinks[key].quantity; i++){
    				$scope.orderDrink(tableid,orders.drinks[key].id);
    			}
    		}

    		//Put in food orders
    		for(key in orders.foods){
    			for (var i = 0; i < orders.foods[key].quantity; i++){
    				$scope.orderFood(tableid,orders.foods[key].id);
    			}
    		}
    	})
  };

	$scope.status = {
		isWorking:false,
		processing:false
	};

	function randomSim(){
		var id = Math.floor((Math.random() * 6));
		// var id =0;
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
				}else if(choice ==3 && !$scope.tables[id].disabled){
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

	function addfood(order){
		var id = $scope.kitchenQueue.indexOf(null);
		if(id > -1){
			$scope.kitchenQueue[id] = order;
        	return id;
		}else{
			$scope.kitchenQueue.push(order);
			return $scope.kitchenQueue.length-1;
		}

	}

	function removeFood(id){
		$scope.kitchenQueue[id] = null;
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
					// 400px

					var moveRight = Math.abs($('#table'+(order.id+1)).position().left - $('.kitchen').position().left);
					var moveLeft = -1 * moveRight;
					if(debug) alert('kitchen top '+ $('.kitchen').position().top);
					var moveDown = Math.abs($('#table'+(order.id+1)).position().top - $('.kitchen').position().top);
					var moveUp = -1 * moveDown;
					if(debug) alert('movedown '+moveDown);

					jQuery('.robot').animate({left:moveLeft}, $scope.animationInterval);
					//jQuery('.robot').animate({top:$('.kitchen').position().top,left:$('#table'+(order.id+1)).position().left},$scope.animationInterval);
					//jQuery('.robot').animate({top:$('#table'+(order.id+1)).position().top,left:$('#table'+(order.id+1)).position().left},$scope.animationInterval, function(){
					jQuery('.robot').animate({top:moveUp}, $scope.animationInterval, function(){
						if((order.type == 'orderFood' || order.type == 'orderDrink') && order.give == 'true'){
							if(debug) alert('remove plate');
							jQuery('img:last-child', this).remove();
						}
						if(order.type == 'orderFood' && order.give == 'false'){
							jQuery('.robot').append("<img src='img/emptyPlate.png' id='emptyPlate' />");
						}else if(order.type == 'orderDrink' && order.give == 'false'){
							jQuery('.robot').append("<img src='img/emptyCup.png' id='emptyCup' />");
						}else if(order.type == 'payCheck'){
							jQuery('.robot').append("<img src='img/bill.png' id='bill' />");
						}
					});
					//jQuery('.robot').animate({top:$('.kitchen').position().top,left:$('#table'+(order.id+1)).position().left},$scope.animationInterval);
					jQuery('.robot').animate({top:'+='+moveDown}, $scope.animationInterval);
					//jQuery('.robot').animate({top:$('.kitchen').position().top,left:$('.kitchen').position().left},$scope.animationInterval,function(){
					jQuery('.robot').animate({left:'+='+moveRight}, $scope.animationInterval, function(){
						if((order.type == 'orderFood' || order.type == "orderDrink") && order.give == 'false'){
							jQuery('img:last-child', this).remove();
						}else if(order.type == 'payCheck'){
							jQuery('img:last-child', this).remove();
							if($scope.playSounds) cash.play();
						}

						$scope.status.processing = false;
						if(order.type=='payCheck'){
							$scope.tables[order.id].disabled = false;
							$scope.tables[order.id].status = 'empty';
							$scope.visits.push(angular.toJson($scope.tables[order.id].visit, false));

							//SEND VISIT JSON TO NEO4j
							$scope.tables[order.id].visit
							console.log(JSON.stringify($scope.tables[order.id].visit));
							$scope.conn.send(JSON.stringify($scope.tables[order.id].visit));
							//Empty the visit for table after sending json 
							//$scope.tables[order.id].visit = {};
							$scope.tables[order.id].visit = {};
						}
						$scope.message = 'Idle';
					});


					//This is to see once the food has been delivered then it will countdown a time for user to eat then to pick up empty plate.
					if(order.type == "orderFood"){
						if(debug) alert('orderFood '+order.item);
						if(order.give == 'true'){
							if(debug)alert('give true');
							setTimeout(function(){
								$scope.orders.push({'message':"Get " + order.item + " from table " + (order.id + 1),'id':order.id,type:'orderFood', give:'false', item:order.item, command:"Get Food" , table: (order.id+1) });
								$rootScope.$broadcast('orderAdded');
							}, $scope.eatingInterval);
						}
					}else if(order.type == "orderDrink"){
						if(debug)alert('orderDrink '+order.item);
						if(order.give == 'true'){
							setTimeout(function(){
								$scope.orders.push({'message':"Get " + order.item + " from table " + (order.id + 1),'id':order.id,type:'orderDrink', give:'false', item:order.item , command:"Get Drink", table:(order.id+1) });
								$rootScope.$broadcast('orderAdded');
							}, $scope.eatingInterval);
						}
					}
				}
				$scope.status.isWorking = false;
			}

		}
	}
});

angular.module('resturant.robot').controller('ModalInstanceCtrl', function ($scope, $rootScope,$modalInstance,foods,drinks,tableid,bill,disabled) {
	$scope.tablenum = tableid + 1;
	$scope.foods = foods;
	$scope.drinks = drinks;
	$scope.max = 10;
	$scope.foodOrders = [];
	$scope.drinkOrders = [];
	$scope.bill = 0;

	$scope.canPay = !disabled;

	$scope.$on('payUpdate',function(event,args){
		if(args.tableid == tableid){
			$scope.canPay = !args.canPay;
		}
	});

	$scope.$on('billUpdate',function(event,args){
		if(args.tableid == tableid){
			$scope.previousBill = args.bill;
		}
	});

	if(bill){
		$scope.previousBill = bill;
	}else{
		$scope.previousBill = 0;
	}


	$scope.range = function(){
		var nums = [];
		for (var i = 0; i <= 5; i++) {
			nums.push(i);
		};
		return nums;
	}

	for(key in $scope.foods){
		$scope.foods[key].quantity = 0;
		$scope.foods[key].id = key;
	}

	for(key in $scope.drinks){
		$scope.drinks[key].quantity = 0;
		$scope.drinks[key].id = key;
	}

	$scope.done = function(){
		$modalInstance.dismiss('cancel');
	}

	$scope.pay = function(){
		$rootScope.$broadcast('payBill',{'tableid':tableid});
		$modalInstance.dismiss('paybill');
	}

	$scope.order = function(){
		var Orders = {'foods':$scope.foodOrders,'drinks':$scope.drinkOrders}
		$modalInstance.close(Orders);
	}

	$scope.updateOrder = function(){
		$scope.foodOrders = [];
		$scope.drinkOrders = [];
		$scope.bill =0;

		for(key in $scope.foods){
			if($scope.foods[key].quantity > 0){
				$scope.foodOrders.push($scope.foods[key]);
				$scope.bill += $scope.foods[key].price * $scope.foods[key].quantity;
			}
		}

		for(key in $scope.drinks){
			if($scope.drinks[key].quantity > 0){
				$scope.drinkOrders.push($scope.drinks[key]);
				$scope.bill += $scope.drinks[key].price * $scope.drinks[key].quantity;
			}
		}
	}
  
});

