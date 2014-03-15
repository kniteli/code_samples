from lib.db import Base
from sqlalchemy import Integer, String, Column
from sqlalchemy.orm import relationship
from sets import Sets

class Blocks(Base):
	"""
		Model for card block set data
	"""
	__tablename__ = 'blocks'

	idblocks = Column(Integer, primary_key=True)
	block_name = Column(String(64))
	sets = relationship(Sets, backref="blocks")

	def __init__(self, block_name):
		self.block_name = block_name