SELECT card_aspects.converted_mana_cost, count(*) FROM decks
LEFT JOIN cards ON decks.cards_idcards = cards.idcards
LEFT JOIN card_aspects ON card_aspects.cards_idcards = cards.idcards
WHERE card_aspects.mana_cost REGEXP '[B]' AND card_aspects.mana_cost not REGEXP '[R|G|W|U]'
GROUP BY card_aspects.converted_mana_cost
