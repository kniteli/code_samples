from lib.db import Base
from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from models.cards import Cards

class Decks(Base):
	__tablename__ = 'decks'

	""" 
		Groups sets of cards into decks. Currently
		this is used to set up decks to draft from
		in the drafting app
	"""

	iddecks = Column(Integer, primary_key=True)

	cards_idcards = Column(Integer, ForeignKey('cards.idcards'))
	cards = relationship(Cards)