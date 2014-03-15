from lib.db import Base
from sqlalchemy import Column, String, Integer, ForeignKey

class CardTypes(Base):
	__tablename__ = "card_types"

	""" Data for the type of card, examples are:
		normal, split, flip, etc"""

	idcard_types = Column(Integer, primary_key=True)
	type_type = Column(String(32))
	type_name = Column(String(64))

	card_aspects_idcard_aspects = Column(Integer, ForeignKey('card_aspects.idcard_aspects'))