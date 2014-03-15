import sys
import os
sys.path.append(os.path.abspath('../'))

from bs4 import BeautifulSoup
from models.cardaspects import CardAspects
from models.sets import Sets
from models.blocks import Blocks
from models.cards import Cards
from models.cardtypes import CardTypes
from lib.db import session
import HTMLParser
import re

#Scripts for ripping card/set/block data from various
#xml files and putting them into a more usable database
#format.

html_parser = HTMLParser.HTMLParser()

def get_multi_aspects(card_data):
	castable = False
	multi = card_data.find('multi')
	if multi['type'] == 'double':
		castable = True
	aspect1 = get_simple_aspects(card_data, True)
	aspect2 = get_simple_aspects(card_data.find('multi'), castable)
	return [aspect1[0], aspect2[0]]

def get_simple_aspects(card_data, castable):
	aspect = CardAspects()
	card_types = []
	aspect.aspect_name = card_data.find('name').getText()
	cost = card_data.find('cost')
	power = card_data.find('pow')
	toughness = card_data.find('tgh')
	loyalty = card_data.find('loyalty')
	aspect.castable_aspect = castable

	if cost:
		aspect.mana_cost = cost.getText()

	if power:
		aspect.power = power.getText()

	if toughness:
		aspect.toughness = toughness.getText()

	if loyalty:
		aspect.loyalty = loyalty.getText()

	for card_type in card_data.find('typelist').findAll('type'):
		dbtype = CardTypes()
		dbtype.type_type = card_type['type']
		dbtype.type_name = card_type.getText()
		card_types.append(dbtype)

	aspect.card_types = card_types

	return [aspect]

soup = BeautifulSoup(open('../../../mtg-data/setinfo.xml').read())

blocks = dict([(row.block_name, row) for row in session.query(Blocks).all()])
sets = dict([(row.set_name, row) for row in session.query(Sets).all()])

for curr_set in soup.setlist.findAll('set'):
	block_name = curr_set.find('block')
	set_code = curr_set.find('code')
	set_name = curr_set.find('name')
	if not set_name:
		continue
	release_date = curr_set.find('release_date')
	dbset = Sets(set_name.getText())

	if dbset.set_name in sets:
		continue

	if(set_code):
		dbset.set_code = set_code.getText()
	if(release_date):
		dbset.release_date = release_date.getText()

	if(block_name):
		block_text = block_name.getText()
		if(block_text in blocks):
			blocks[block_text].sets.append(dbset)
		else:
			temp_block = Blocks(block_text)
			temp_block.sets.append(dbset)
			blocks[block_text] = temp_block
	else:
		session.add(dbset)

for block in blocks.values():
	session.merge(block)

session.commit()

sets = dict([(row.set_name, row) for row in session.query(Sets).all()])

card_soup = BeautifulSoup(open('../../../mtg-data/cards.xml').read())
card_meta_soup = BeautifulSoup(open('../../../mtg-data/meta.xml').read())

card_in_set_count = dict()

card_data = card_soup.cardlist.find('card')

for card in card_meta_soup.metalist.findAll('card'):
	card_name = card['name']
	print card_name
	if card_data.find('name').getText() != card_name:
		print "ERROR!"
		break
	for card_instance in card.findAll('instance'):
		card = Cards()
		set_name = card_instance.set.getText()
		rarity = card_instance.rarity.getText()
		artist = card_instance.artist
		card.name = card_name
		number = card_instance.number
		card.rarity = rarity

		if number:
			card.card_number = number.getText()

		if artist:
			card.artist = html_parser.unescape(artist.getText())


		multi = card_data.multi
		aspects = []
		if multi:
			card.card_type = multi['type']
			multi_name = multi.find('name').getText()
			card.full_name = card_name + " // " + multi_name
			aspects = get_multi_aspects(card_data)
		else:
			card.card_type = "simple"
			card.full_name = card_name
			aspects = get_simple_aspects(card_data, True)

		if set_name in card_in_set_count:
			if card_name in card_in_set_count[set_name]:
				if card.card_type == 'double':
					continue
				card_in_set_count[set_name][card_name] += 1
			else:
				card_in_set_count[set_name][card_name] = 1
		else:
			card_in_set_count[set_name] = dict()
			card_in_set_count[set_name][card_name] = 1
		card.card_alternate_id = card_in_set_count[set_name][card_name]
		card.card_aspects = aspects
		sets[set_name].cards.append(card)

	card_data = card_data.findNext('card')

for dbset in sets.values():
	session.merge(dbset)

session.commit()

import os, inspect

relative_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
os.chdir(relative_dir)
for card in session.query(Cards).all():
	set_code = card.sets.set_code
	card_name = re.sub('[\?:"]', '', card.name)
	if set_code in ['HOP', 'M14', 'VAN', 'PC2', 'ASTRA', 'DREAM', 'PPR']:
		continue
	if card.card_type == 'double':
		card_name = re.sub('[ /]', '', card.full_name)
	for aspect in card.card_aspects:
		if card.card_type == 'transform':
			card_name = re.sub('[\?:"]', '', aspect.aspect_name)

		image_path_with_alt = os.path.abspath("..\\..\\..\\magicimages\\Fulls\\"+set_code+"\\"+card_name+str(card.card_alternate_id)+".full.jpg")
		image_path_without_alt = os.path.abspath("..\\..\\..\\magicimages\\Fulls\\"+set_code+"\\"+card_name+".full.jpg")
		if os.path.exists(image_path_with_alt):
			aspect.image_path = image_path_with_alt
		elif os.path.exists(image_path_without_alt):
			aspect.image_path = image_path_without_alt
		else:
			print "No image for: "+card_name+"\nFrom: "+card.sets.set_name

session.commit()