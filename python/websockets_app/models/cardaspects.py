from lib.db import Base
from sqlalchemy import Column, String, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from cardtypes import CardTypes

class CardAspects(Base):
	"""
		CardAspects are single parts of a card. For example
		if a card is a flip card, it only has 1 card id,
		but it has 2 card aspects, one for each side. If the
		card is a split card, it will similarly have 1 card
		and 2 aspects, one for each spell on the card. Most
		cards will have only 1 aspect.
	"""
	__tablename__ = 'card_aspects'

	idcard_aspects = Column(Integer, primary_key=True)
	aspect_name = Column(String(128))
	mana_cost = Column(String(64))
	power = Column(String(10))
	toughness = Column(String(10))
	loyalty = Column(String(10))
	castable_aspect = Column(Boolean)
	image_path = Column(String(128))
	converted_mana_cost = Column(Integer)

	card_types = relationship(CardTypes, backref="card_aspects")
	cards_idcards = Column(Integer, ForeignKey('cards.idcards'))