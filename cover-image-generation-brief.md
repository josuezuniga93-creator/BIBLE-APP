# Cover Image Generation Brief

## Goal

Generate personalized cover images for every Free Book and Historical Document in the phone app. These should not be generic gradient covers. Each cover should visually match the title, era, author, and content.

## Recommended Asset Specs

- Aspect ratio: `2:3`
- Suggested size: `1024x1536`
- Style: premium illustrated book cover, readable title, historical Christian / Reformed aesthetic
- Avoid: emojis, modern clipart, random glowing effects, unreadable tiny text
- Theme compatibility: art should work on Premium Neon, Pink Blossom, and Light Elegant
- Suggested file paths:
  - Free books: `frontend/public/covers/books/{slug}.png`
  - Historical documents: `frontend/public/covers/historical/{id}.png`

## Free Books

1. `pilgrims-progress` — **The Pilgrim's Progress** by John Bunyan, 1678  
   Cover concept: a lone pilgrim walking from a dark ruined city toward a distant radiant celestial city, carrying a burden and staff, English Puritan allegory mood.

2. `grace-abounding` — **Grace Abounding to the Chief of Sinners** by John Bunyan, 1666  
   Cover concept: a prison cell with warm light breaking through a small window onto an open journal and Bible, symbolizing Bunyan's conversion and grace in spiritual darkness.

3. `confessions-augustine` — **Confessions** by Augustine of Hippo, c. 400  
   Cover concept: Augustine seated in late-antique North African study, open manuscript, restless heart motif, warm candlelight, ancient church atmosphere.

4. `imitation-of-christ` — **The Imitation of Christ** by Thomas à Kempis, 1418  
   Cover concept: a quiet medieval monastery corridor, simple wooden cross, open devotional manuscript, humble interior devotion.

5. `institutes-of-religion` — **Institutes of the Christian Religion** by John Calvin, 1536  
   Cover concept: Reformation-era Geneva study, stacked theological volumes, quill, open Scripture, orderly architectural frame, sober Reformed theology.

6. `holiness-ryle` — **Holiness** by J.C. Ryle, 1879  
   Cover concept: Victorian pastoral study with a worn Bible and clear morning window light, clean disciplined composition, sanctification and practical godliness.

7. `morning-evening-spurgeon` — **Morning and Evening** by Charles H. Spurgeon, 1865  
   Cover concept: split dawn and twilight sky over an open Bible, London Baptist devotional tone, warm gold and deep blue balance.

8. `sinners-in-hands-edwards` — **Sinners in the Hands of an Angry God & Other Sermons** by Jonathan Edwards, 1741  
   Cover concept: colonial New England meetinghouse interior, pulpit, storm-dark sky through windows, urgent sermon atmosphere without horror imagery.

9. `all-of-grace` — **All of Grace** by Charles H. Spurgeon, 1886  
   Cover concept: simple open gate with warm gospel light, hand receiving a gift-like book, Victorian evangelical invitation, grace as free gift.

10. `knowledge-of-the-holy` — **The Knowledge of the Holy** by A.W. Tozer, 1961  
   Cover concept: contemplative modern-classic theological cover, vast night sky over a small chapel silhouette, divine attributes, reverence and awe.

## Historical Documents

1. `jerusalem-council` — **The Jerusalem Council**, AD 49  
   Cover concept: early apostles gathered around a table in Jerusalem, scrolls open, warm stone room, Acts 15 council deciding grace for Gentiles.

2. `apostles-creed` — **The Apostles' Creed**, AD 140  
   Cover concept: early Christian baptismal setting in ancient Rome, simple water basin, trinitarian manuscript lines, ancient symbol of faith.

3. `council-nicaea` — **Council of Nicaea**, AD 325  
   Cover concept: bishops assembled in imperial hall at Nicaea, Constantine-era council atmosphere, central open creed scroll, defense of Christ's deity.

4. `nicene-creed` — **The Nicene Creed**, AD 381  
   Cover concept: illuminated creed manuscript with subtle trinitarian geometry, Constantinople council setting, solemn universal confession.

5. `athanasian-creed` — **Athanasian Creed**, c. AD 500  
   Cover concept: precise Latin manuscript, triangular trinitarian diagram, Western church manuscript texture, doctrinal clarity.

6. `council-chalcedon` — **Council of Chalcedon**, AD 451  
   Cover concept: ancient council chamber with two-natures symbolism, one central Christological manuscript, Byzantine architectural mood.

7. `augustine-grace` — **Augustine on Grace & Election**, AD 397  
   Cover concept: Augustine writing in Hippo, North African bishop's study, scrolls on grace, warm earth tones and theological gravity.

8. `council-carthage` — **Council of Carthage**, AD 418  
   Cover concept: North African council of bishops, parchment canons against Pelagianism, austere stone and sunlight, original sin and grace theme.

9. `council-orange` — **Second Council of Orange**, AD 529  
   Cover concept: Gallic church council manuscript, golden-orange parchment, early medieval bishops, emphasis on grace before faith.

10. `wycliffe` — **Wycliffe & the Pre-Reformation**, 1378  
   Cover concept: John Wycliffe translating Scripture by candlelight at Oxford, English manuscript pages, pre-Reformation tension.

11. `jan-hus` — **Jan Hus — Martyr of Bohemia**, 1415  
   Cover concept: Jan Hus before the Council of Constance, manuscript and pulpit imagery, martyrdom suggested by solemn warm firelight, not graphic.

12. `gutenberg` — **Gutenberg Bible & the Printing Press**, 1455  
   Cover concept: Gutenberg press with fresh Bible pages, movable type blocks, Mainz workshop, printing revolution.

13. `95theses` — **The 95 Theses**, 1517  
   Cover concept: Wittenberg church door with parchment theses nailed to wood, early Reformation autumn tones, bold but historical.

14. `diet-of-worms` — **Diet of Worms**, 1521  
   Cover concept: Luther standing before emperor and council, solitary conscience before empire, dramatic hall lighting, "Here I stand" mood.

15. `tyndale` — **Tyndale's New Testament**, 1526  
   Cover concept: William Tyndale's English New Testament manuscript, smuggled books and candlelight, Reformation translation courage.

16. `calvins-institutes` — **Calvin's Institutes of the Christian Religion**, 1536  
   Cover concept: young Calvin's Basel manuscript desk, structured theology, open Bible and systematic volumes, Renaissance Reformed design.

17. `augsburg-confession` — **Augsburg Confession**, 1530  
   Cover concept: confession presented before Emperor Charles V, German imperial hall, parchment confession held forward.

18. `smalcald-articles` — **Smalcald Articles**, 1537  
   Cover concept: Luther's final theological testament on a desk, bold Reformation seal-like composition, justification at the center.

19. `geneva-bible` — **The Geneva Bible**, 1560  
   Cover concept: English exiles in Geneva printing or studying Scripture, marginal notes visible, Puritan Bible heritage.

20. `belgic-confession` — **Belgic Confession**, 1561  
   Cover concept: Guido de Brès writing under persecution, confession manuscript, Netherlands setting, courage and warmth.

21. `heidelberg` — **Heidelberg Catechism**, 1563  
   Cover concept: Heidelberg study room, catechism pages, comfort theme, warm pastoral teaching atmosphere.

22. `thirty-nine-articles` — **Thirty-Nine Articles**, 1563  
   Cover concept: English Reformation church interior, formal article manuscript, Anglican/Reformed doctrinal standard.

23. `canons-of-dort` — **Canons of Dort**, 1619  
   Cover concept: Synod of Dort delegates around a long table, Dutch Reformed council, five doctrinal points implied by five seals or columns.

24. `king-james-bible` — **King James Bible**, 1611  
   Cover concept: Authorized Version printing room, ornate Bible page, Jacobean England, dignified royal manuscript style.

25. `five-solas` — **The Five Solas of the Reformation**, 1517  
   Cover concept: five Reformation pillars or banners labeled by visual symbols, Scripture at center, elegant Protestant summary.

26. `first-london-baptist` — **First London Baptist Confession**, 1644  
   Cover concept: small gathering of Particular Baptist churches in London, confession manuscript, believer's baptism suggested by water motif.

27. `westminster-confession` — **Westminster Confession of Faith**, 1646  
   Cover concept: Westminster Assembly chamber, theologians around documents, grand but sober Reformed confession atmosphere.

28. `westminster-shorter` — **Westminster Shorter Catechism**, 1647  
   Cover concept: catechism instruction scene, teacher and young learner with open Q&A manuscript, Westminster room, clear and approachable.

29. `westminster-larger` — **Westminster Larger Catechism**, 1648  
   Cover concept: large theological manuscript with Ten Commandments and Lord's Prayer motifs, Westminster Assembly scholarly tone.

30. `1689-lbc` — **Second London Baptist Confession of Faith**, 1689  
   Cover concept: 107 Particular Baptist churches represented by gathered ministers, London confession manuscript, Scripture and believer's baptism symbolism.

31. `sinners-in-hands` — **Sinners in the Hands of an Angry God**, 1741  
   Cover concept: Jonathan Edwards preaching in Enfield meetinghouse, congregation stirred, storm-lit windows, urgent Great Awakening atmosphere.

32. `monergism-debate` — **Monergism vs. Synergism**, 1525  
   Cover concept: Luther and Erasmus represented by opposing desks or manuscripts, divine grace versus human cooperation visual tension, theological debate.

## Suggested Claude Task

Ask Claude:

```text
Using cover-image-generation-brief.md, generate personalized cover image assets for every Free Book and Historical Document. Do not use generic gradients or emojis. Make each cover match the title, era, author, and theological content. Save assets under frontend/public/covers/books and frontend/public/covers/historical, then update the app to use those images with generated fallback only if an image is missing.
```
