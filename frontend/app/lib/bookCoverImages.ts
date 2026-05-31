export const BOOK_COVER_IMAGES: Record<string, string> = {
  "pilgrims-progress": "/covers/books/pilgrims-progress.png",
  "grace-abounding": "/covers/books/grace-abounding.png",
  "confessions-augustine": "/covers/books/confessions-augustine.png",
  "imitation-of-christ": "/covers/books/imitation-of-christ.png",
  "institutes-of-religion": "/covers/books/institutes-of-religion.png",
  "holiness-ryle": "/covers/books/holiness-ryle.png",
  "morning-evening-spurgeon": "/covers/books/morning-evening-spurgeon.png",
  "sinners-in-hands-edwards": "/covers/books/sinners-in-hands-edwards.png",
  "mortification-of-sin": "/covers/books/mortification-of-sin.png",
  "bondage-of-the-will": "/covers/books/bondage-of-the-will.png",
  "religious-affections": "/covers/books/religious-affections.png",
  "death-of-death": "/covers/books/death-of-death.png",
  "body-of-divinity": "/covers/books/body-of-divinity.png",
  "freedom-of-the-will": "/covers/books/freedom-of-the-will.png",
  "commentary-on-romans-hodge": "/covers/books/commentary-on-romans-hodge.png",
  "fourfold-state": "/covers/books/fourfold-state.png",
  "practical-religion": "/covers/books/practical-religion.png",
  "knots-untied": "/covers/books/knots-untied.png",
  "thoughts-for-young-men": "/covers/books/thoughts-for-young-men.png",
  "duties-of-parents": "/covers/books/duties-of-parents.png",
  "all-of-grace": "/covers/books/all-of-grace.png",
  "knowledge-of-the-holy": "/covers/books/knowledge-of-the-holy.png",
};

export function getBookCoverImage(slug: string): string | undefined {
  return BOOK_COVER_IMAGES[slug];
}
