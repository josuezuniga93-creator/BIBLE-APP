// ─── Reformed Article Library ─────────────────────────────────────────────────
// Articles are fed in locally (full text stored below). No network/scraping.
// Rotation advances every 3 days. Rotation starts: 2026-05-31 (day 0 = index 0).

export interface GraceGemsArticle {
  id: number;
  author: string;
  authorYears: string;
  title: string;
  url: string;
  summary: string;
  tags: string[];
  content?: string;  // full article text stored locally — no network needed
}

export const GRACE_GEMS_ARTICLES: GraceGemsArticle[] = [
  {
    id: 1,
    author: "Richard Sibbes",
    authorYears: "1577–1635",
    title: "Means to Make Grace Victorious",
    url: "https://www.gracegems.org/Sibbes/means_to_make_grace_victorious.htm",
    summary: "Practical rules for ensuring Christ's grace triumphs — right judgment, tender conscience, walking in step with the Spirit — and warnings against sinful ignorance.",
    tags: ["Sanctification", "Grace", "Practical Godliness"],
    content: `As to directions on how we are to conduct ourselves so that the judgment of Christ in us may indeed be victorious, we must know that, though Christ has undertaken this victory, yet he accomplishes it by training us up to fight his battles. He overcomes in us by making us 'wise unto salvation' (1 Timothy 3:15); and, in the measure that we believe Christ will conquer, in that measure we will endeavour by his grace that we may conquer, for faith is an obedient and a wise grace. Christ makes us wise to ponder and weigh things, and to rank and order them accordingly, so that we may make the fitter choice of what is best. Some rules to help us in judging are these:

RULES FOR RIGHT JUDGMENT

We should judge of things as to whether they help or hinder our main purpose; whether they further or hinder our judgment; whether they make us more or less spiritual, and so bring us nearer to the fountain of goodness, God himself; whether they will bring us peace or sorrow at the last; whether they commend us more or less to God, and whether they are the thing in which we shall approve ourselves to him most. We should also judge of things now as we shall do hereafter when the soul shall be best able to judge, as when we are under any public calamity, or at the hour of death, when the soul gathers itself from all other things to itself. We should look back to former experience and see what is most agreeable to it, and what was best in our worst times. If grace is or was best then, it is best now. We should also labour to judge of things as he does who must judge us, and as holy men judge, who are led by the Spirit. More particularly, we should judge according to what those judge that have no interest in any benefit that may come by the thing which is in question; for outward things blind the eyes even of the wise. We see that papists are most corrupt in those things where their honour, ease, or profit is engaged; but in the doctrine of the Trinity, which does not touch on these things, they are sound. But it is not sufficient that judgment is right. It must also be ready and strong.

KEEPING OUR JUDGMENT CLEAR

1. Where Christ establishes his government, he inspires care to keep the judgment clear and fresh, for while the judgment stands straight and firm, the whole frame of the soul continues strong and impregnable. True judgment in us advances Christ, and Christ will advance it. All sin is either from false principles, or ignorance, or thoughtlessness, or unbelief of what is true. By lack of consideration and weakness of assent, Eve lost her hold at first (Genesis 3:6). It is good, therefore, to store up true principles in our hearts, and to refresh them often, that, in virtue of them, our affections and actions may be more vigorous. When judgment is fortified, evil finds no entrance, but good things have a side within us to entertain them. While true convincing light continues, we will not do the least ill of sin for the greatest ill of punishment. 'In vain the net is spread in the sight of any bird' (Proverbs 1:17). While the soul is kept aloft, there is little danger of snares below. We must lose our high estimation of things before we can be drawn to any sin.

2. And because knowledge and affection mutually help one another, it is good to keep up our affections of love and delight by all sweet inducements and divine encouragements; for what the heart likes best, the mind studies most. Those that can bring their hearts to delight in Christ know most of his ways. Wisdom loves him that loves her. Love is the best entertainer of truth; and when it is not entertained in the love of it (2 Thessalonians 2:10), lovely as it is, it leaves the heart, and will stay no longer. It has been a successful way of corrupting the judgment, to begin by withdrawing love, because, as we love, so we tend to judge. And therefore it is hard to be affectionate and wise in earthly things. But in heavenly things, where there has been a right informing of the judgment before, the more our affections grow, the better and clearer our judgments will be, because our affections, though strong, can never rise high enough to reach the excellency of the things. We see in the martyrs, when the sweet doctrine of Christ had once gained their hearts, it could not be removed again by all the torments the wit of cruelty could devise. If Christ has once possessed the affections, there is no dispossessing of him again. A fire in the heart overcomes all fires without.

3. Wisdom also teaches us where our weakness lies, and our enemy's strength. By this means a jealous fear is stirred up in us, whereby we are preserved; for out of this godly jealousy we keep those provocations, which are active and working, from that which is passive and catching in us, as we keep fire from powder. Those who wish to hinder the generation of noisome creatures will hinder the conception first, by keeping male and female apart. This jealous care will be much furthered by observing strictly what has helped or hindered a gracious temper in us, and it will make us take heed that we consult not with flesh and blood in ourselves or others. Otherwise, how can we think that Christ will lead us out to victory, when we take counsel with his and our enemies?

4. Christ also makes us careful to use all means by which fresh thoughts and affections may be stirred up and preserved in us. Christ so honours the use of means, and the care he bestows on us, that he ascribes both preservation and victory to our care in keeping ourselves. 'He that is begotten of God keepeth himself' (1 John 5:18), though not by himself, but by the Lord, in dependence on him, in the use of means. We are only safe when we wisely make use of all good advantages that we have access to. By going out of God's ways we go out of his government, and so lose our good frame of mind, and find ourselves overspread quickly with a contrary disposition. When we draw near to Christ (James 4:8), in his ordinances, he draws near to us.

5. We must keep grace in exercise. It is not sleepy habits, but grace in exercise, that preserves us. While the soul is in some civil or sacred employment, corruptions within us are much suppressed, and Satan's ways of approach to us stopped. The Spirit then has a way open to enlarge his influence in us, and likewise the protection of angels is then closest to us. This course often prevails more against our spiritual enemies than direct opposition. Christ is in honour bound to maintain those that are in his work.

6. In following all these directions, we must look up to Christ, the quickening Spirit, and make our resolutions in his strength. Though we are exhorted to cleave to the Lord with full purpose of heart (Acts 11:23), yet we must pray with David, 'Keep this for ever in the imagination of the thoughts of the heart of thy people, and prepare their heart unto thee' (1 Chronicles 29:18). Our hearts are of themselves very loose and unsettled. 'Unite my heart to fear thy name' (Psalms 86:11), or else, without him, our best purposes will fall to the ground. It is a pleasing request, out of love to God, to beg such a frame of soul from him, that he may take delight in it; and therefore, in the use of all the means, we must send up our desires and complaints to him for strength and help, and then we may be sure that he will 'send forth judgment unto victory.'

7. Lastly, it furthers the state of the soul to know what frame it should be in, that so we may order our souls accordingly. We should always be fit for communion with God, and be heavenly-minded in earthly business, and be willing to be taken off from it to redeem time for better things. We should be ready at all times to depart hence, and to live in such a condition as we would be content to die in. We should have hearts prepared for every good duty, open to all good opportunities, and shut to all temptations, keeping our watch, and being always ready armed. So far as we come short of these things, so far we have just cause to be humbled, and yet we should press forward, so that we may gain more upon ourselves, and make these things more familiar and lovely to us. And when we find our souls at all declining, it is best to raise them up presently by some awakening meditations, such as of the presence of God, of the strict reckoning we are to make, of the infinite love of God in Christ and the fruits of it, of the excellency of a Christian's calling, of the short and uncertain time of this life, of how little good all those things that steal away our hearts will do us before long, and of how it shall be for ever with us hereafter, as we spend this short time well or ill. The more we make way for such considerations to sink into our hearts, the more we shall rise nearer to that state of soul which we shall enjoy in heaven. When we grow careless of keeping our souls, then God recovers our taste of good things again by sharp crosses. Thus David, Solomon and Samson were recovered. This taste of good things is much easier kept than recovered.

REASONS FOR SEEMING LACK OF PROGRESS

Objection: But, notwithstanding my striving, I seem to remain at a standstill.

1. Grace, as the seed in the parable, grows, we know not how. Yet at length, when God sees fittest, we shall see that all our endeavour has not been in vain. The tree falls upon the last stroke, yet all the strokes help the work forward.

2. Sometimes victory is suspended because some Achan is not found out, or because we are not humble enough, as Israel had the worst against the Benjamites till they fasted and prayed (Judges 20:26); or because we betray our helps, and do not stand on our guard, and do not soon yield to the motions of the Spirit, who puts us in mind always of the best things, if we would regard his prompting. Our own consciences will tell us, if we give them leave to speak, that some sinful favouring of ourselves is the cause. The way in this case to prevail is, first, to get the victory over the pride of our own nature by taking shame to ourselves, in humble confession to God; and then, secondly, to overcome the unbelief of our hearts by yielding to the promise of pardon; and then, thirdly, in confidence of Christ's assistance, to set ourselves against those sins which have prevailed over us. So prevailing over ourselves, we shall easily prevail over all our enemies, and conquer all conditions we shall be brought into.

ALL SHOULD SIDE WITH CHRIST

The second use of the truth that Christ will have the victory is to establish the fact that the best course for nations and states is to 'kiss the Son' (Psalms 2:12), and to embrace Christ and his religion; to side with Christ, and to own his cause in the world. His side will prove the stronger side at last. Happy are we if Christ honours us so much as to use our help to fight his battle 'against the mighty' (Judges 5:23). True religion in a state is as the main pillar of a house and the post of a tent that upholds all. So also for families, let Christ be the chief governor of the family. And let every one be as a house of Christ, to dwell familiarly in, and to rule. Where Christ is, all happiness must follow. If Christ goes, all will go. Where Christ's government, in his ordinances and his Spirit, is, there all subordinate government will prosper. Religion inspires life and grace into all other things. All other virtues without it are but as a fair picture without a head. Where Christ's laws are written in the heart, there all other good laws are best obeyed. None despise man's law but those that despise Christ's first. Nemo humanam auctoritatem contemnit, nisi qui divinam prius contempsit. Of all persons, a man guided by Christ is the best; and of all creatures in the world, a man guided merely by will and affection, next to the devil, is the worst. The happiness of weaker things stands in being ruled by stronger. It is best for a blind man to be guided by him that has sight. It is best for sheep, and other feckless creatures, to be guided by man. And it is happiest for man to be guided by Christ, because his government is so victorious that it frees us from the fear and danger of our greatest enemies, and tends to bring us to the greatest happiness that our nature is capable of. This should make us rejoice when Christ reigns in us. When Solomon was crowned, the people rejoiced so that the city rang (1 Kings 1:45). Much more should we rejoice in Christ our king.

And likewise for those whose souls are dear to us, our endeavour should be that Christ may reign in them also, that they may be baptized by Christ with this fire (Matthew 3:11), that these sparks may be kindled in them. Men labour to cherish the spirit and mettle, as they term it, of those they train up, because they think they will have use of it in the manifold affairs and troubles of this life. Oh, but let us cherish the sparks of grace in them; for a natural spirit in great troubles will fail, but these sparks will make them conquerors over the greatest evils.

The third use of the truth of Christ's victory is to observe that if Christ's judgment shall be victorious, then popery, being an opposite frame, set up by the wit of man to maintain stately idleness, must fall. And it is fallen already in the hearts of those on whom the light of Christ has shone. It is a lie, and founded on a lie, on the infallible judgment of a man subject to sin and error. When that which is taken for a principle of truth becomes a principle of error, the more reliance on it, the more danger there is.`,
  },
];

// ─── Rotation engine ─────────────────────────────────────────────────────────
// Rotates every 3 days. Day 0 = 2026-05-31.

const ROTATION_START = new Date("2026-05-31T00:00:00Z").getTime();
const THREE_DAYS_MS  = 3 * 24 * 60 * 60 * 1000;

export function getRotatingArticle(): GraceGemsArticle {
  const elapsed      = Math.max(0, Date.now() - ROTATION_START);
  const period       = Math.floor(elapsed / THREE_DAYS_MS);
  const index        = period % GRACE_GEMS_ARTICLES.length;
  return GRACE_GEMS_ARTICLES[index];
}

/** How many days remain until the next rotation (0 = rotates today). */
export function daysUntilNextRotation(): number {
  const elapsed    = Math.max(0, Date.now() - ROTATION_START);
  const msInPeriod = elapsed % THREE_DAYS_MS;
  const msLeft     = THREE_DAYS_MS - msInPeriod;
  return Math.ceil(msLeft / (24 * 60 * 60 * 1000));
}
