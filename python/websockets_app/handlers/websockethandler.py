import tornado.websocket
from lib.db import session
from sqlalchemy import *
from sqlalchemy.orm import joinedload
from models.cards import Cards
from models.sets import Sets
from models.cardaspects import CardAspects
from lib.memoryzip import MemoryZip
from lib.draftbehavior import WinstonDraft
import base64
import random
import uuid
import json

all_players = {}
decks = []
decks_pointers = {}
player_decks = {}
images = {}
piles = []
players_opponents = {}

class WebSocketHandler(tornado.websocket.WebSocketHandler):
	has_priority = False

	"""
		Websocket handler acts as the gobetween when two
		players are drafting.
	"""

	def __init__(self, application, request, **kwargs):
		tornado.websocket.WebSocketHandler.__init__(self, application, request, **kwargs)
		self.message_behavior = {
			'get_card_images': WebSocketHandler.get_card_images,
			'get_cards': WebSocketHandler.get_card_data,
			'get_cards_for_pile': WebSocketHandler.get_pile_cards,
			'confirm_pile': WebSocketHandler.confirm_pile,
			'reject_pile': WebSocketHandler.reject_pile
		}

	def reset_piles(self):
		for x in xrange(0,3):
			self.pile_put_down(x);
		for player in all_players.values():
			player.write_message(json.dumps({"message_type": "reset_piles", "payload": "None"}))

	def pile_picked_up(self, pile_num):
		global all_players
		for player in all_players.values():
			player.write_message(json.dumps({"message_type": "pile_picked_up", "payload": pile_num}))

	def pile_put_down(self, pile_num):
		global all_players
		for player in all_players.values():
			player.write_message(json.dumps({"message_type": "pile_put_down", "payload": pile_num}))

	def confirm_pile(self, pile_num):
		global piles
		global player_decks
		global decks
		global all_players
		global decks_pointers
		player_decks[self.id].append(piles[pile_num])
		self.has_priority = False
		all_players[players_opponents[self.id]].has_priority = True
		self.update_priority()
		try:
			piles[pile_num] = [decks[decks_pointers[self.id]].pop()]
			self.pile_put_down(pile_num)
			for player in all_players.values():
				player.write_message(json.dumps({"message_type": "pile_update", "payload": {"pile_num": pile_num, "pile_count": len(piles[pile_num])}}))
		except IndexError:
			pass

	def reject_pile(self, pile_num):
		global piles
		global decks
		global all_players
		global decks_pointers
		try:
			piles[pile_num].append(decks[decks_pointers[self.id]].pop())
			self.pile_put_down(pile_num)
			for player in all_players.values():
				player.write_message(json.dumps({"message_type": "pile_update", "payload": {"pile_num": pile_num, "pile_count": len(piles[pile_num])}}))
		except IndexError:
			self.pile_put_down(pile_num)

	def get_pile_cards(self, pile_num):
		global piles
		cards = piles[pile_num]
		self.write_message(json.dumps({"message_type": "show_pile", "payload": {"cards": cards, "pile_num": pile_num}}))
		self.pile_picked_up(pile_num)

	def get_card_images(self, card_id):
		global images
		self.write_message(json.dumps({"message_type": "card_image", "payload": {"aspect_id": card_id, "image": images[card_id]}}), False)

	def get_card_data(self, data):
		global decks
		card = decks[self.id].pop()
		self.write_message(json.dumps({"message_type": "card_data", "payload": card}, False))

	def init_piles(self):
		global piles
		global decks
		piles = [[decks[decks_pointers[self.id]].pop()] for x in xrange(0, 3)]
		self.reset_piles()

	def map_card_data(self, cards):
		ret = []
		for card in cards:
			new_card = {}
			new_card["card_id"] = card.idcards
			new_card["card_name"] = card.full_name
			new_card["card_type"] = card.card_type
			new_card["card_aspects"] = []
			for aspects in card.card_aspects:
				new_card["card_aspects"].append({"image_id": aspects.idcard_aspects})
				images[aspects.idcard_aspects] = base64.b64encode(open(aspects.image_path, "rb").read())
			ret.append(new_card)

		return ret

	def open(self):
		global all_players
		global decks
		global player_decks
		global decks_pointers
		global players_opponents
		print "WebSocket opened"
		self.id = uuid.uuid4()
		all_players[self.id] = self
		if len(decks) >= 1:
			decks.pop()
		cards = session.query(Cards).options(joinedload(Cards.card_aspects)).join(Sets).filter(Sets.set_code.in_(['DGM', 'GTC', 'RTR'])).all()
		card_data = self.map_card_data(cards)
		random.shuffle(card_data)
		decks.append(card_data[0:90])
		decks_pointers[self.id] = len(decks) - 1
		self.init_piles()
		player_decks[self.id] = []
		for key, value in player_decks.iteritems():
			player_decks[key] = []
		for key, value in all_players.iteritems():
			if self.id == key:
				pass
			else:
				players_opponents[self.id] = key
				players_opponents[key] = self.id
		if len(all_players) > 1:
			self.init_priority()
			self.update_priority()
		card_back = base64.b64encode(open("D:\\Users\\Roderick\\workspace\\magic_app\\magicimages\\Basics\\Back.full.jpg", "rb").read())
		self.write_message(json.dumps({"message_type": "card_back", "payload": card_back}), False)

	def update_priority(self):
		for player in all_players.values():
			if len(all_players) < 2:
				message = "waiting_for_player"
			elif player.has_priority:
				message = "gained_priority"
			else:
				message = "lost_priority"
			player.write_message(json.dumps({"message_type": "update_priority", "payload": message}))

	def init_priority(self):
		for key, val in all_players.iteritems():
			all_players[key].has_priority = False
			all_players[key].roll = random.randint(1, 20)

		if all_players[players_opponents[self.id]].roll == self.roll:
			self.init_priority()
		elif all_players[players_opponents[self.id]].roll < self.roll:
			self.has_priority = False
			all_players[players_opponents[self.id]].has_priority = True
		else:
			self.has_priority = True
			all_players[players_opponents[self.id]].has_priority = False

	def on_message(self, message):
		recv = json.loads(message);
		self.message_behavior.get(recv["message_type"], lambda x, y: None)(self, recv["payload"]);

	def on_close(self):
		global decks
		global player_decks
		global decks_pointers
		global players_opponents
		print "WebSocket closed"
		deck_index = decks_pointers[self.id]
		del decks_pointers[self.id]
		if deck_index not in decks_pointers.values():
			decks.pop()
		del player_decks[self.id]
		del all_players[self.id]
		del players_opponents[self.id]
		self.update_priority()
