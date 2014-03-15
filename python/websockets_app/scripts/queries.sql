

SELECT cards.name, card_aspects.mana_cost, card_aspects.converted_mana_cost FROM decks
LEFT JOIN cards ON decks.cards_idcards = cards.idcards
LEFT JOIN card_aspects ON card_aspects.cards_idcards = cards.idcards
WHERE card_aspects.mana_cost REGEXP '[U]' AND card_aspects.mana_cost not REGEXP '[B|G|W|R]'
AND EXISTS 
       ( SELECT 1 
           FROM card_types
          WHERE card_aspects.idcard_aspects = card_types.card_aspects_idcard_aspects
           AND (card_types.type_name = 'Instant' OR card_types.type_name = 'Sorcery')
       )