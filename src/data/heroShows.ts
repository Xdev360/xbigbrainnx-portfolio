// Hero slides that use the tilted-device show (everything except Mylo, which has its own kingdom scene).
// Copy on the cards is taken from the real screens. Times are ms inside the slide's loop.
const V = '/work/virelle-store/';
const C = '/work/chatgrow/';

export const heroShows: Record<string, any> = {
  'virelle-store': {
    name: 'Virelle Store', bg: '#0F3D2E', shape: '#17573F', device: 'phone', T: 12000,
    box: { cx: 880, top: 78, w: 204, h: 440, ry: -16, rz: 3 },
    screens: [
      { src: `${V}home.webp`, from: 0, to: 4500, scroll: 900 },
      { src: `${V}product.webp`, from: 4500, to: 7500, scroll: 380 },
      { src: `${V}vira.webp`, from: 7500, to: 9800 },
      { src: `${V}checkout.webp`, from: 9800, to: 12000, scroll: 220 },
    ],
    pops: [
      { side: 'l', edge: 770, y: 118, at: [300, 4300], icon: 'calendar-check', html: 'Expiry date on every item' },
      { side: 'r', edge: 1000, y: 150, at: [900, 4300], icon: 'shield-check', html: 'Original, bought in the UK and US' },
      { side: 'l', edge: 770, y: 150, at: [4700, 7400], kind: 'card', html: `<img class="pimg" src="${V}biotin.webp" alt="" /><span class="tag">EXP AUG 2028</span><span class="k">Nutricost</span><span class="b">Biotin 10,000 mcg</span><span class="row"><span class="b">₦33,000</span></span>` },
      { side: 'r', edge: 1000, y: 250, at: [5200, 7400], icon: 'truck', html: 'Delivered in 5 to 7 working days' },
      { side: 'r', edge: 1000, y: 110, at: [7700, 9700], kind: 'bubble', html: `<span><span class="b">Vira</span><br/>Tell me what's going on. Hair shedding, bloating, always tired, dark spots... I'll pull what's on the shelf.</span>` },
      { side: 'r', edge: 1000, y: 250, at: [8200, 9700], html: `<span class="chips"><span>hair is shedding</span><span>dark spots</span></span>` },
      { side: 'l', edge: 770, y: 260, at: [10000, 11900], kind: 'cta', html: 'Place order · ₦84,000' },
      { side: 'r', edge: 1000, y: 170, at: [10700, 11900], icon: 'circle-check', html: 'Pay by bank transfer, then tap "I have sent it"' },
    ],
  },
  chatgrow: {
    name: 'ChatGrow', bg: '#101A44', shape: '#1C2C6E', device: 'browser', T: 12000,
    box: { cx: 880, top: 88, w: 440, h: 286, ry: -14, rz: 0 },
    screens: [
      { src: `${C}front-desk.webp`, from: 0, to: 4000 },
      { src: `${C}calendar.webp`, from: 4000, to: 8000 },
      { src: `${C}channels.webp`, from: 8000, to: 12000 },
    ],
    extra: { src: `${C}qr-phone.webp`, cx: 560, top: 150, h: 220, ry: 14, rz: -4, alt: 'ChatGrow QR ordering' },
    pops: [
      { side: 'r', edge: 1130, y: 104, at: [400, 3800], icon: 'user-plus', html: "Today's arrivals <span class=\"b\">24</span>" },
      { side: 'r', edge: 1130, y: 168, at: [1200, 3800], icon: 'wrench', html: '3 rooms need maintenance' },
      { side: 'r', edge: 1130, y: 104, at: [4300, 7800], icon: 'bed-double', html: '6 arrivals today have no room assigned' },
      { side: 'r', edge: 1130, y: 168, at: [5000, 7800], icon: 'calendar-range', html: 'Pick any free room from the calendar' },
      { side: 'r', edge: 1130, y: 104, at: [8300, 11800], icon: 'link', html: 'Booking.com · Connected' },
      { side: 'r', edge: 1130, y: 168, at: [9000, 11800], icon: 'triangle-alert', html: 'Expedia · Auth failed · Fix setup' },
      { side: 'l', edge: 520, y: 120, at: [1500, 5600], icon: 'qr-code', html: 'Table 12 · Order goes straight to the kitchen' },
      { side: 'l', edge: 520, y: 120, at: [6400, 10800], icon: 'bed', html: 'Charge to my room · Room 201' },
    ],
  },
};
