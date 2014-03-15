var stage;
var main_layer;

$(document).ready(function() {
	var app = new MainApp();
});

function DisplayZone(width, height, x, y, scale) {
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;
	this.scale = scale || 1.0;

	this.addChild = function(child) {

	}
}

function Card(layer, image, x, y, scale, ui_scale, draggable) {
	this.image = new Image();
	this.drawable = null;
	this.scale = scale || 1.0;
	this.ui_scale = ui_scale || 1.0;
	this.x = x*this.ui_scale;
	this.y = y*this.ui_scale;
	this.draggable = draggable;
	var double_click_timer = 0;
	var that = this;
	var main_layer = layer;

	this.double_click_handler = function() {

	};

	this.image.onload = function() {
		var k_image = new Kinetic.Image({
			x: that.x,
			y: that.y,
			image: this,
			width: this.width,
			height: this.height,
			scale: that.scale*that.ui_scale,
			draggable: that.draggable
		});
		k_image.setOffset(k_image.getWidth()/2, k_image.getHeight()/2);
		// add the shape to the layer
		that.drawable = k_image;
		main_layer.add(that.drawable);
		that.drawable.on('mousedown', function() {
			this.moveToTop();
		    var date = new Date();
		    var now = date.getTime();
		    if(now - double_click_timer < 300) {
	    		that.double_click_handler();
	    		double_click_timer = 0;
		    }
		    double_click_timer = now;
		});
		main_layer.draw();
	};
	this.image.src = image;
}

function WS(websocket_address) {
	var ws = new WebSocket("ws://192.168.1.130:8888/ws");
	var callbacks = {};
	// ws.binaryType = "arraybuffer";
	ws.onopen = function() {
		// ws.send("test");
	};
	ws.onmessage = function (evt) {
		var response = JSON.parse(evt.data);
		if(response.message_type in callbacks) {
			var len = callbacks[response.message_type].length;
			for(var i=0; i<len; i++) {
				callbacks[response.message_type][i](response.payload);
			}
		}
	};

	this.register_handler = function(message, callback) {
		if(message in callbacks) {
			callbacks[message].push(callback);
		} else {
			callbacks[message] = [callback];
		}
	}

	this.send = function(message) {
		ws.send(message);
	}
}

function MainApp() {
	var stage = new Kinetic.Stage({
		container: 'main',
		width: window.innerWidth,
		height: window.innerHeight
	});
	var fullScaleX = 1920;
	var fullScaleY = 950;
	var resize_ratio = getResizeRatio(stage.getWidth(), stage.getHeight(), fullScaleX, fullScaleY);
	var card_back_image_data = null;
	var card_data = {};
	var card_image_recieved_listener = {};
	var main_layer = new Kinetic.Layer();
	var text_layer = new Kinetic.Layer();
	var over_layer = null;
	var card_piles = [];
	var card_count = [];
	var player_has_priority = false;
	stage.add(main_layer);
	stage.add(text_layer);
	var ws = new WS("ws://192.168.1.129:8888/ws");
	var status_text = null;
	addStatusText();
	ws.register_handler('card_back', function(data) {
		for(var i = 0; i < 3; i++) {
			var new_card_image = new Card(main_layer, "data:image/jpeg;base64,"+data, 500+480*i, stage.getHeight()/(2*resize_ratio), 0.5, resize_ratio, false);
			var temp_text = new Kinetic.Text({
				text: "1",
				fontSize: 64*resize_ratio,
				fontStyle: "bold",
				stroke: "#000000",
				strokeWidth: 3*resize_ratio,
				x: 500*resize_ratio+(480*i*resize_ratio)-18*resize_ratio,
				y: (stage.getHeight()/(2))-18*resize_ratio,
				fill: 'white'
			});
			card_count.push(temp_text);
			text_layer.add(card_count[i]);
			new_card_image.pile = i;
			new_card_image.double_click_handler = function() {
				if(player_has_priority) {
					var message = {message_type: "get_cards_for_pile", payload: this.pile};
					ws.send(JSON.stringify(message));
				}
			};
			card_piles.push(new_card_image);
		}
		text_layer.draw();
		card_back_image_data = data;
	});
	ws.register_handler('card_image', function(data) {
		card_data[data.aspect_id] = data.image;
		if(data.aspect_id in card_image_recieved_listener) {
			card_image_recieved_listener[data.aspect_id](data);
			delete card_image_recieved_listener[data.aspect_id];
		}
	});
	ws.register_handler('card_data', function(data) {
		if(data.card_aspects[0].image_id in card_data) {
			addCard(main_layer, card_data[data.card_aspects[0].image_id], 500, stage.getHeight()/(2*resize_ratio), 0.5, resize_ratio);
		} else {
			var message = {message_type: "get_card_images", payload: data.card_aspects[0].image_id};
			listenForCardImageRecieved(data.card_aspects[0].image_id, function(data) {
				addCard(main_layer, card_data[data.card_aspects[0].image_id], 500, stage.getHeight()/(2*resize_ratio), 0.5, resize_ratio);
			});
			ws.send(JSON.stringify(message));
		}
	});
	ws.register_handler('show_pile', function(data) {
		over_layer = new Kinetic.Layer();
		var data_cards = data.cards;
		var pile_num = data.pile_num;
		var x_cards_page_scale = stage.getWidth()/(680*data_cards.length*resize_ratio);
		var y_cards_page_scale = stage.getHeight()/900*resize_ratio;
		var cards_page_scale = (x_cards_page_scale <= y_cards_page_scale)?x_cards_page_scale:y_cards_page_scale;
		var cards_printed = 0;
		var length = data_cards.length
		var overlay = new Kinetic.Rect({
			fill: '#111',
			opacity: 0.5,
			width: stage.getWidth(),
			height: stage.getHeight()
		});
		over_layer.add(overlay);

		for(var i = 0; i < length; i++) {
			if(data_cards[i].card_aspects[0].image_id in card_data) {
				var adj = cards_printed - Math.floor(length/2);
				var correction = 0;
				if(length % 2 == 0) {
					correction = 340 * cards_page_scale;
				}
				x_pos = (adj*680*cards_page_scale+correction) + (stage.getWidth()/(2*resize_ratio));
				addCard(over_layer, card_data[data_cards[i].card_aspects[0].image_id], x_pos, stage.getHeight()/2/resize_ratio, cards_page_scale, resize_ratio);
				cards_printed++;
			} else {
				var message = {message_type: "get_card_images", payload: data_cards[i].card_aspects[0].image_id};
				listenForCardImageRecieved(data_cards[i].card_aspects[0].image_id, function(data) {
					var adj = cards_printed - Math.floor(length/2);
					var correction = 0;
					if(length % 2 == 0) {
						correction = 340 * cards_page_scale;
					}
					x_pos = (adj*680*cards_page_scale+correction) + (stage.getWidth()/(2*resize_ratio));
					addCard(over_layer, card_data[data.aspect_id], x_pos, stage.getHeight()/2/resize_ratio, cards_page_scale, resize_ratio);
					cards_printed++;
				});
				ws.send(JSON.stringify(message));			
			}
		}
		var confirm_button = new Kinetic.Rect({
			fill: '#2dd71c',
			stroke: '#218f15',
			strokeWidth: 15*resize_ratio,
			width: 200*resize_ratio,
			height: 50*resize_ratio,
			x: 250*resize_ratio,
			y: (stage.getHeight() - 100*resize_ratio)
		});
		confirm_button.on('click', function() {
			var message = {message_type: "confirm_pile", payload:pile_num};
			ws.send(JSON.stringify(message));
			over_layer.destroy();
		});
		over_layer.add(confirm_button);
		var reject_button = new Kinetic.Rect({
			fill: '#d71c1c',
			stroke: '#8f1515',
			strokeWidth: 15*resize_ratio,
			width: 200*resize_ratio,
			height: 50*resize_ratio,
			x: stage.getWidth() - 450*resize_ratio,
			y: stage.getHeight() - 100*resize_ratio
		});
		reject_button.on('click', function() {
			var message = {message_type: "reject_pile", payload:pile_num};
			ws.send(JSON.stringify(message));
			over_layer.destroy();
		});
		over_layer.add(reject_button);
		stage.add(over_layer);
	});
	ws.register_handler('pile_update', function(data) {
		card_count[data.pile_num].setText(data.pile_count);
		text_layer.draw();
	});
	ws.register_handler('pile_picked_up', function(pile_num) {
		card_count[pile_num].setVisible(false);
		card_piles[pile_num].drawable.setVisible(false);
		main_layer.draw();
		text_layer.draw();
	});
	ws.register_handler('pile_put_down', function(pile_num) {
		if(card_count[pile_num]) {
			card_count[pile_num].setVisible(true);
			card_piles[pile_num].drawable.setVisible(true);
			main_layer.draw();
			text_layer.draw();
		}
	});
	ws.register_handler('reset_piles', function() {
		var length = card_count.length;
		for(var i=0; i<length; i++) {
			card_count[i].setText("1");
		}
		text_layer.draw()
		if(over_layer) {
			over_layer.destroy();
		}
	});
	ws.register_handler('update_priority', function(data) {
		if(data == 'waiting_for_player') {
			player_has_priority = false;
			status_text.setText("Waiting for players");			
		}
		else if(data == 'gained_priority') {
			player_has_priority = true;
			status_text.setText("Your turn");
		} else {
			player_has_priority = false;
			status_text.setText("Opponents turn");
		}
		status_text.setPosition({x: (stage.getWidth()/2)-18*resize_ratio-status_text.getWidth()/2})
		text_layer.draw();
	});
	$(window).on('resize', function() {
		resize();
	});

	function addStatusText() {
		var text = "Waiting for players"
		status_text = new Kinetic.Text({
			text: text,
			fontSize: 64*resize_ratio,
			fontStyle: "bold",
			stroke: "#000000",
			strokeWidth: 3*resize_ratio,
			x: (stage.getWidth()/2)*resize_ratio-18*resize_ratio,
			y: 100*resize_ratio-18*resize_ratio,
			fill: 'white'
		});
		status_text.setPosition({x: (stage.getWidth()/2)-18*resize_ratio-status_text.getWidth()/2})
		text_layer.add(status_text);
		text_layer.draw();
	}

	function listenForCardImageRecieved(image_id, callback) {
		card_image_recieved_listener[image_id] = callback;
	}

	function addCard(layer, data, x, y, scale, ratio) {
		new_card_image = new Card(layer, "data:image/jpeg;base64,"+data, x, y, scale, ratio, true);
		new_card_image.double_click_handler = function() {
			if(this.rotated) {
				var tween = new Kinetic.Tween({
					node: this.drawable, 
					duration: 0.1,
					rotationDeg: 0,
				});
				tween.play();
				this.rotated = false;
			} else {
				var tween = new Kinetic.Tween({
					node: this.drawable, 
					duration: 0.1,
					rotationDeg: 90,
				});
				tween.play();
				this.rotated = true;
			}
		};		
	}

	function resize() {
		stage.setWidth(window.innerWidth);
		stage.setHeight(window.innerHeight);
		resize_ratio = getResizeRatio(stage.getWidth(), stage.getHeight(), fullScaleX, fullScaleY);
	}

    function getResizeRatio(startWidth, startHeight, newWidth, newHeight){
        var ratioX = startWidth / newWidth ;
        var ratioY = startHeight / newHeight ;

        return ratioX <= ratioY ? ratioX : ratioY;
    };
}