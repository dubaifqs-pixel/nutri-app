// Pre-built image library: maps product keywords to category images
// When a product is scanned, we match its name to a category and show the image

const CATEGORY_KEYWORDS: { category: string; keywords: string[] }[] = [
  { category: 'cookies', keywords: ['protein bar', 'energy bar', 'granola bar', 'barebells', 'quest bar', 'oatbar', 'oat bar', 'rxbar', 'kind bar', 'larabar', 'cliff bar', 'clif bar'] },
  { category: 'chocolate', keywords: ['chocolate', 'cocoa', 'kitkat', 'kit kat', 'snickers', 'twix', 'mars', 'bounty', 'nutella', 'ferrero', 'cadbury', 'galaxy', 'toblerone', 'oreo', 'm&m', 'maltesers', 'kinder'] },
  { category: 'softdrink', keywords: ['cola', 'coca-cola', 'coca cola', 'pepsi', 'sprite', 'fanta', 'mirinda', '7up', 'mountain dew', 'soda', 'soft drink', 'carbonated', 'fizzy'] },
  { category: 'juice', keywords: ['juice', 'rani', 'tropicana', 'minute maid', 'vimto', 'tang', 'capri sun', 'capri-sun', 'nectar', 'squash', 'lemonade'] },
  { category: 'milk', keywords: ['milk', 'laban', 'dairy', 'almarai', 'al ain', 'al rawabi', 'cream', 'buttermilk'] },
  { category: 'chips', keywords: ['chips', 'crisps', 'lays', 'lay\'s', 'pringles', 'doritos', 'cheetos', 'takis', 'popcorn', 'nachos', 'pretzel'] },
  { category: 'cereal', keywords: ['cereal', 'cornflakes', 'corn flakes', 'muesli', 'granola', 'oats', 'oatmeal', 'weetabix', 'cheerios', 'fitness', 'special k', 'coco pops', 'frosties'] },
  { category: 'bread', keywords: ['bread', 'croissant', 'toast', 'baguette', 'roll', 'bun', 'pita', 'naan', 'flatbread', 'tortilla', 'wrap', 'bakery', 'pastry', 'cake', 'muffin', 'donut', 'lusine', 'samosa'] },
  { category: 'water', keywords: ['water', 'mai dubai', 'masafi', 'arwa', 'evian', 'voss', 'perrier', 'sparkling water'] },
  { category: 'energy', keywords: ['energy', 'red bull', 'redbull', 'monster', 'power horse', 'sting', 'boost', 'lucozade', 'gatorade'] },
  { category: 'icecream', keywords: ['ice cream', 'icecream', 'gelato', 'frozen yogurt', 'magnum', 'baskin', 'häagen', 'haagen', 'cornetto', 'popsicle', 'sorbet'] },
  { category: 'chicken', keywords: ['chicken', 'poultry', 'turkey', 'nugget', 'drumstick', 'wing', 'breast', 'meat', 'beef', 'lamb', 'burger', 'sausage', 'hotdog', 'mortadella', 'shawarma', 'kebab'] },
  { category: 'fruit', keywords: ['fruit', 'apple', 'banana', 'orange', 'mango', 'strawberry', 'grape', 'pineapple', 'watermelon', 'berry', 'vegetable', 'tomato', 'cucumber', 'salad'] },
  { category: 'cookies', keywords: ['cookie', 'biscuit', 'wafer', 'cracker', 'digestive', 'mcvitie', 'lotus', 'biscoff'] },
  { category: 'yogurt', keywords: ['yogurt', 'yoghurt', 'activia', 'danone', 'greek yogurt', 'labneh'] },
  { category: 'cheese', keywords: ['cheese', 'cheddar', 'mozzarella', 'parmesan', 'feta', 'cream cheese', 'philadelphia', 'kiri', 'laughing cow', 'puck'] },
]

// Default fallback image by grade
const GRADE_FALLBACK: Record<string, string> = {
  A: '/products/cat-fruit.png',
  B: '/products/cat-milk.png',
  C: '/products/cat-cereal.png',
  D: '/products/cat-chips.png',
  E: '/products/cat-chocolate.png',
}

export function getProductImage(productName: string, grade?: string): string {
  const name = productName.toLowerCase()

  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    for (const keyword of keywords) {
      if (name.includes(keyword)) {
        return `/products/cat-${category}.png`
      }
    }
  }

  // Neutral fallback — a generic packaged-product image rather than misleading
  // the user with a milk bottle / chocolate bar for an unmatched product.
  // The grade-based fallback was removing accuracy more than it was adding (a
  // grade-B protein bar got the milk image), so we use a category-neutral hero.
  // The `grade` argument is kept for callers but is no longer consulted here.
  void grade
  return '/products/snacks.png'
}

// Get category image for browse pages — uses dedicated hero category images
export function getCategoryImage(categoryId: string): string {
  const mapping: Record<string, string> = {
    dairy: '/products/dairy.png',
    beverages: '/products/beverages.png',
    snacks: '/products/snacks.png',
    cereals: '/products/cereals.png',
    bread: '/products/bread-bakery.png',
    meat: '/products/meat-poultry.png',
    fruits: '/products/fruits-veg.png',
    frozen: '/products/frozen.png',
  }
  return mapping[categoryId] || '/products/fruits-veg.png'
}
