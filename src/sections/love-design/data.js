import { designYourLoveDecks } from '../../_mock/_design-your-love';

// Keep source wording and identifiers intact. Translation happens only at render time.
export const decks = designYourLoveDecks;
export const cards = decks.flatMap((deck) =>
  deck.categories.flatMap((category) =>
    category.cards.map((card) => ({
      ...card,
      deckId: deck.id,
      deckName: deck.name,
      categoryId: category.id,
      category: category.name,
      color: category.color,
    }))
  )
);
export const cardById = Object.fromEntries(cards.map((card) => [card.id, card]));
export const deckFilters = [
  ...decks.map((deck) => ({
    id: deck.id,
    name: deck.name,
    count: cards.filter((card) => card.deckId === deck.id).length,
  })),
  { id: 'all', name: '全部', count: cards.length },
];
