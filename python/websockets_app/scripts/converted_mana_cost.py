# -*- coding: utf-8 -*-
import sys
import os

sys.path.append(os.path.abspath('../'))

from models.cards import CardAspects
from lib.db import session
import re

#Script to calculate and update all card aspect's
#converted mana costs

cards = session.query(CardAspects)

for card in cards:
	costs = str(card.mana_cost).split('}')
	cmc = 0
	costs.pop()
	# print costs
	for cost in costs:
		tmp_str = cost.translate(None, '{')
		if tmp_str == 'X':
			pass
		elif tmp_str.isdigit():
			cmc += int(tmp_str)
		else:
			cmc += 1

	card.converted_mana_cost = cmc

session.commit()
