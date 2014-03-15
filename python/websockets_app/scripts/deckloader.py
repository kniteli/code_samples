# -*- coding: utf-8 -*-
import sys
import os

sys.path.append(os.path.abspath('../'))

from bs4 import BeautifulSoup

from models.cards import Cards
from models.decks import Decks
from lib.db import session
import re

#loads a .deck format card deck into the database
#card deck format

session.query(Decks).delete()
session.commit()
cards = session.query(Cards)
cards_map = {}
for card in cards:
	if card.card_type == 'double':
		cards_map[re.sub(u' // ', '_', card.full_name)] = card
	else:
		cards_map[re.sub(u'Æ', 'AE', card.name)] = card

soup = BeautifulSoup(open('../../../mtg-data/tempcube.deck').read())

cards_list = soup.findAll('deck')[0].findAll('section')[0].findAll('item')

for card in cards_list:
	deck = Decks()
	if card["id"] in cards_map:
		deck.cards_idcards = cards_map[card["id"]].idcards
		session.add(deck)
	else:
		print "No Match for card " + card["id"]

session.commit()