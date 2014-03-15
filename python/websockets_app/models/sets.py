from lib.db import Base
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from cards import Cards

class Sets(Base):
	__tablename__ = 'sets'

	"""
		Sets, which blocks are composed of. These are
		mostly informational and don't have anything
		to do with rules. A group of cards will fall
		under a set, often with reprints and a different
		image for each set.
	"""

	idsets = Column(Integer, primary_key=True)
	set_name = Column(String(64))
	set_code = Column(String(5))
	release_date = Column(DateTime())
	blocks_idblocks = Column(Integer, ForeignKey('blocks.idblocks'))
	set_image_path = Column(String(64))

	cards = relationship(Cards, backref="sets")

	def __init__(self, set_name, set_code="", release_date="", set_image_path=""):
		self.set_name = set_name
		self.set_code = set_code
		self.release_date = release_date
		self.set_image_path = set_image_path