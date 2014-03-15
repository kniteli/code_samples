import urllib2
import urllib
import urlparse
from BeautifulSoup import BeautifulSoup
from sqlalchemy import *
from sqlalchemy.ext.declarative import declarative_base  
from sqlalchemy.orm import sessionmaker, mapper
import re
import time
import types

# This file contains a scraper for all the card data at
# gatherer.wizards.com

engine = create_engine('sqlite:///../cards_db_2.db', echo=True)
Base = declarative_base(engine)
########################################################################
class Cards(Base):
    """"""
    __tablename__ = 'cards'

    cards_id = Column('cards_id', Integer, primary_key=True)
    card_name = Column('card_name', String(128))
    set_name = Column('set_name', String(64))
    card_type = Column('card_type', String(64))
    mana_cost = Column('mana_cost', String(32))
    converted_mana_cost = Column('converted_mana_cost', Integer)
    oracle_text = Column('oracle_text', String(1024))
    printed_text = Column('printed_text', String(1024))
    flavor_text = Column('flavor_text', String(1024))
    artist = Column('artist', String(32))
    power = Column('power', String(8))
    toughness = Column('toughness', String(8))
    loyalty = Column('loyalty', String(8))
    card_image = Column('card_image', LargeBinary)
    card_subtype = Column('card_subtype', String(64))
    rarity = Column('rarity', String(32))
    card_number = Column('card_number', String(8))

    def __init__(	self,
    				name,
    				card_set,
    				card_type,
    				mana_cost,
    				converted_mana_cost,
    				artist,
    				oracle_text,
    				printed_text,
    				flavor_text,
    				power,
    				toughness,
    				subtype,
    				rarity,
    				loyalty,
    				card_number):
    	self.card_name = name
    	self.set_name = card_set
    	self.card_type = card_type
    	self.mana_cost = mana_cost
    	self.converted_mana_cost = converted_mana_cost
    	self.oracle_text = oracle_text
    	self.printed_text = printed_text
    	self.flavor_text = flavor_text
    	self.artist = artist
    	self.power = power
    	self.toughness = toughness
    	self.card_subtype = subtype
    	self.loyalty = loyalty
    	self.rarity = rarity
    	self.card_number = card_number

class TempCard(object):
	loyalty = "None"
	power = "None"
	toughness = "None"
	flavor_text = ""
	oracle_text = ""
	printed_text = ""
	subtype = ""
	converted_mana_cost = 0
	mana_cost = "None"
	card_number = None
	def commit(self, session):
		commit_card = Cards(self.name,
							self.set,
							self.card_type,
							self.mana_cost,
							self.converted_mana_cost,
							self.artist,
							self.oracle_text,
							self.printed_text,
							self.flavor_text,
							self.power,
							self.toughness,
							self.subtype,
							self.rarity,
							self.loyalty,
							self.card_number)
		session.add(commit_card)
#----------------------------------------------------------------------
def loadSession():
    """"""
    metadata = Base.metadata
    Session = sessionmaker(bind=engine)
    session = Session()
    return session

sets = [
	"Visions",
	"Weatherlight",
	"Worldwake",
	"Zendikar"]

def is_split_card_page(soup):
	return soup.findAll('td', 'cardComponentContainer')[1].getText().strip() != ""

def process_split_card_oracle(curr_card, soup):
	card_components = soup.findAll('td', 'cardComponentContainer')
	match = re.search('\(([a-z,\'\-\sA-Z]+)\)', curr_card.name)
	actual_card_name = curr_card.name
	if match:
		actual_card_name = match.group(1)
	for comp in card_components:
		for row in comp.findAll('div', 'row'):
			row_label = row.find('div', 'label').getText().strip()
			row_value = row.find('div', 'value')
			if row_label == "Card Name:" and actual_card_name != row_value.getText().strip():
				break
			else:
				curr_card = update_card(row_label, row_value, curr_card)

	return curr_card

def process_split_card_printed(curr_card, soup):
	card_components = soup.findAll('td', 'cardComponentContainer')
	match = re.search('\(([a-z,\'\-\sA-Z]+)\)', curr_card.name)
	actual_card_name = curr_card.name
	if match:
		actual_card_name = match.group(1)

	for comp in card_components:
		for row in comp.findAll('div', 'row'):
			row_label = row.find('div', 'label').getText().strip()
			row_value = row.find('div', 'value')
			if row_label == "Card Name:" and actual_card_name != row_value.getText().strip():
				break
			elif row_label == 'Card Text:':
				curr_card.printed_text = "".join([unicode(x) for x in row_value.findAll('div', 'cardtextbox')])

	return curr_card

def update_card(row_label, row_value, curr_card):
	if row_label == 'Converted Mana Cost:':
		curr_card.converted_mana_cost = int(row_value.getText().strip())
	elif row_label == 'Types:':
		type_list = row_value.getText().strip().split(u'\u2014')
		curr_card.card_type = type_list[0]
		if len(type_list) > 1:
			curr_card.subtype = type_list[1]
	elif row_label == 'Card Text:':
		curr_card.oracle_text = "".join([unicode(x) for x in row_value.findAll('div', 'cardtextbox')])
	elif row_label == 'Flavor Text:':
		curr_card.flavor_text = "".join([unicode(x) for x in row_value.findAll('div', 'cardtextbox')])
	elif row_label == 'P/T:':
		power_tough_text = row_value.getText().strip()
		power_tough = power_tough_text.split('/')
		curr_card.power = power_tough[0]
		curr_card.toughness = power_tough[1]
	elif row_label == 'Loyalty:':
		curr_card.loyalty = row_value.getText().strip()
	elif row_label == 'Expansion:':
		curr_card.set = row_value('a')[1].getText().strip()
	elif row_label == 'Rarity:':
		curr_card.rarity = row_value('span')[0].getText().strip()
	elif row_label == 'Card Number:':
		curr_card.card_number = row_value.getText().strip()
	elif row_label == 'Artist:':
		if(len(row_value('a')) > 0):
			curr_card.artist = row_value('a')[0].getText().strip()
		else:
			curr_card.artist = row_value.getText().strip()

	return curr_card

def process_oracle_page(curr_card, url):
	soup = BeautifulSoup(urllib2.urlopen(url))
	print curr_card.name
	if is_split_card_page(soup):
		curr_card = process_split_card_oracle(curr_card, soup)
	else:
		details = soup(id="ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_rightCol")[0]
		rows = details.findAll('div', 'row')
		for row in rows:
			row_label = row.find('div', 'label').getText().strip()
			row_value = row.find('div', 'value')
			curr_card = update_card(row_label, row_value, curr_card)

	return curr_card

def process_printed_page(curr_card, url):
	soup = BeautifulSoup(urllib2.urlopen(url))
	if is_split_card_page(soup):
		curr_card = process_split_card_printed(curr_card, soup)
	else:
		details = soup(id="ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_rightCol")[0]
		rows = details.findAll('div', 'row')
		for row in rows:
			row_label = row.find('div', 'label').getText().strip()
			row_value = row.find('div', 'value')
			if row_label == 'Card Text:':
				curr_card.printed_text = "".join([unicode(x) for x in row_value.findAll('div', 'cardtextbox')])
	return curr_card

session = loadSession()

last_page = 0
current_page = 0
got_last_page = False
detail_pages_oracle = "http://gatherer.wizards.com/Pages/Card/Details.aspx?printed=false&multiverseid="
detail_pages_printed = "http://gatherer.wizards.com/Pages/Card/Details.aspx?printed=true&multiverseid="

for current_set in sets:
	print current_set
	soup = BeautifulSoup(urllib2.urlopen("http://gatherer.wizards.com/Pages/Search/Default.aspx?output=spoiler&method=text&set=[%22"+urllib.quote_plus(current_set)+"%22]"))

	# if not got_last_page:
	# 	last_page = int(urlparse.parse_qs(urlparse.urlparse(soup.find('div', 'paging')('a')[-2]['href']).query)['page'][0])
	# 	got_last_page = True

	rows = soup.find('div', 'textspoiler')('tr')
	curr_card = TempCard()
	first_card = True
	for row in rows:
		if(len(row('td')) < 2):
			continue
		row_type = row('td')[0].getText().strip()
		row_data = row('td')[1]
		if row_type == 'Name':
			if not first_card:
				curr_card.commit(session)
			else:
				first_card = False
			curr_card = TempCard()
			curr_card.name = row_data('a')[0].getText().strip()
			card_temp_id = row_data('a')[0]['href'].strip().split('=')[1]
			curr_card = process_oracle_page(curr_card, detail_pages_oracle+card_temp_id)
			curr_card = process_printed_page(curr_card, detail_pages_printed+card_temp_id)
		elif row_type == 'Cost:':
			if(row_data.getText().strip() != ""):
				curr_card.mana_cost = row_data.getText().strip()

	curr_card.commit(session)
	session.commit()
