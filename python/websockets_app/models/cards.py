from lib.db import Base
from sqlalchemy import Column, String, Integer, ForeignKey, CHAR, Text
from sqlalchemy.orm import relationship
from cardaspects import CardAspects

class Cards(Base):
	__tablename__ = 'cards'

	""" A card represents a physical magic card """

	idcards = Column(Integer, primary_key=True)
	name = Column(String(128))
	card_type = Column(String(32))
	card_alternate_id = Column(Integer)
	flavor_text = Column(Text)
	rarity = Column(CHAR(1))
	card_number = Column(Integer)
	artist = Column(String(256))
	full_name = Column(String(256))

	card_aspects = relationship(CardAspects, backref="cards")
	sets_idsets = Column(Integer, ForeignKey('sets.idsets'))