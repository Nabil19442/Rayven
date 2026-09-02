import React, { useState, useEffect } from 'react';
import { useStore } from '../contexts/StoreContext';
import { db } from '../lib/db';
import { FAQItem, CMSPage } from '../types';
import { 
  Award, ShieldCheck, Truck, RotateCcw, Phone, Mail, 
  MapPin, Send, HelpCircle, FileText, CheckCircle2, ChevronDown, Loader2 
} from 'lucide-react';

interface InfoPagesProps {
  page: 'about' | 'contact' | 'faq' | 'returns' | 'terms' | 'privacy';
  onNavigate: (path: string) => void;
}

export const InfoPages: React.FC<InfoPagesProps> = ({ page, onNavigate }) => {
  const { settings, formatBDT, showToast } = useStore();

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactSubject, setContactSubject] = useState('Order Enquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // Dynamic Data State
  const [cmsPage, setCmsPage] = useState<CMSPage | null>(null);
  const [faqList, setFaqList] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (page === 'faq') {
      db.getFAQs().then((items) => {
        if (items && items.length > 0) {
          setFaqList(items);
        }
      });
    } else if (page !== 'contact') {
      setLoading(true);
      db.getCMSPage(page).then((data) => {
        setCmsPage(data);
        setLoading(false);
      });
    }
  }, [page]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim() || !contactMessage.trim()) {
      showToast('Please fill in your name, phone number, and message.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await db.createContactMessage({
        name: contactName,
        email: contactEmail || '',
        phone: contactPhone,
        subject: contactSubject,
        message: contactMessage,
      });

      setIsSent(true);
      showToast('Message sent! Our support team will respond shortly.', 'success');
    } catch {
      showToast('Failed to send message. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultFaqs: { q: string; a: string }[] = [
    {
      q: 'Are your jerseys authentic master-quality editions?',
      a: 'Yes, 100%. RAYVEN specializes in high-density silicone crests, pro-grade AEROREADY & HEAT.RDY fabrications, and authentic rubber heat-transfer player printing identical to what players wear on European matchdays.'
    },
    {
      q: 'What is the delivery timeline and cost across Bangladesh?',
      a: `Inside Dhaka: ${formatBDT(settings.inside_dhaka_delivery_fee || 70)} (delivered within 24 to 48 hours). Outside Dhaka (all 64 districts): ${formatBDT(settings.outside_dhaka_delivery_fee || 130)} (delivered within 48 to 72 hours via SteadFast/Pathao). Orders over ${formatBDT(settings.free_shipping_threshold || 3000)} receive FREE delivery.`
    },
    {
      q: 'Can I inspect the jersey before paying on Cash on Delivery (COD)?',
      a: 'Yes, absolutely! You are encouraged to open the parcel and inspect the fabric, size tag, and crest quality in front of the delivery agent before paying.'
    },
    {
      q: 'What is your size exchange policy?',
      a: 'We provide a 7-day hassle-free size replacement policy. As long as the jersey tags are attached and the garment is unworn, we will dispatch a replacement size to your doorstep.'
    },
    {
      q: 'Can I get custom player name and number printing?',
      a: 'Yes! We offer official font custom name and number printing (e.g. MESSI 10, BELLINGHAM 5, MBAPPE 9) with heat-press flock at zero additional charge.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-[#1F2024]">
      {/* 1. ABOUT PAGE */}
      {page === 'about' && (
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono font-bold text-[#6D35C8] uppercase tracking-widest">
              WHO WE ARE
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-black text-[#1F2024] uppercase tracking-tight">
              {cmsPage?.title || `About ${settings.store_name || 'RAYVEN'} Football`}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-xl mx-auto leading-relaxed">
              Forged by passionate football fanatics for the vibrant Bangladeshi football community.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-[#E5E5E3] space-y-6 text-xs sm:text-sm text-zinc-700 leading-relaxed shadow-sm">
            {cmsPage?.content ? (
              <div className="whitespace-pre-line">{cmsPage.content}</div>
            ) : (
              <>
                <p>
                  Founded in Dhaka, <strong>{settings.store_name || 'RAYVEN'}</strong> was born out of a desire to eliminate poor-quality sportswear counterfeits and provide Bangladeshi football lovers with tournament-grade matchday kits.
                </p>
                <p>
                  Whether you are supporting Real Madrid in the Champions League, cheering on Argentina's 3-Star legacy, or rocking a vintage Zidane 1998 classic on a weekend turf match, we make sure every stitch, silicone crest, and breathable fiber delivers pure excellence.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div className="p-4 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E3] text-center space-y-1">
                    <p className="font-display text-3xl font-black text-[#6D35C8]">10,000+</p>
                    <p className="text-xs text-zinc-500 font-medium">Jerseys Delivered</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E3] text-center space-y-1">
                    <p className="font-display text-3xl font-black text-[#6D35C8]">64</p>
                    <p className="text-xs text-zinc-500 font-medium">Districts Covered</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F7F7F5] border border-[#E5E5E3] text-center space-y-1">
                    <p className="font-display text-3xl font-black text-[#6D35C8]">4.9 ★</p>
                    <p className="text-xs text-zinc-500 font-medium">Verified Customer Rating</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. CONTACT PAGE */}
      {page === 'contact' && (
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold text-[#6D35C8] uppercase tracking-widest">
              GET IN TOUCH
            </span>
            <h1 className="font-display text-4xl font-black text-[#1F2024] uppercase tracking-tight">
              Contact & Helpline
            </h1>
            <p className="text-xs text-zinc-600">
              Reach out to our customer support team for order inquiries, custom bulk jerseys, or exchanges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Info Col */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E5E3] space-y-6 shadow-sm">
              <h3 className="font-display text-lg font-bold text-[#1F2024] uppercase">
                Customer Support Hub
              </h3>

              <div className="space-y-4 text-xs text-zinc-600">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#6D35C8] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[#1F2024]">WhatsApp & Direct Helpline:</p>
                    <a href={`tel:${settings.phone || '+8801700000000'}`} className="text-[#6D35C8] font-mono text-sm block mt-0.5 hover:underline font-bold">
                      {settings.phone || '+880 1700-000000'}
                    </a>
                    <p className="text-[11px] text-zinc-500">Everyday: 10:00 AM - 11:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#6D35C8] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[#1F2024]">Email Support:</p>
                    <a href={`mailto:${settings.email || 'support@rayven.store'}`} className="text-zinc-700 font-mono block mt-0.5 hover:underline">
                      {settings.email || 'support@rayven.store'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#6D35C8] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[#1F2024]">Showroom / Dispatch Facility:</p>
                    <p className="text-zinc-600 mt-0.5">{settings.address || 'House 42, Road 11, Block D, Banani, Dhaka 1213, Bangladesh'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Col */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E5E3] space-y-4 shadow-sm">
              <h3 className="font-display text-lg font-bold text-[#1F2024] uppercase">
                Send Us A Message
              </h3>

              {isSent ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-bold text-emerald-800 text-sm">Message Sent Successfully!</p>
                  <p className="text-xs text-zinc-500">Our customer representative will call or WhatsApp you shortly.</p>
                  <button
                    onClick={() => {
                      setIsSent(false);
                      setContactMessage('');
                    }}
                    className="mt-2 text-xs font-bold text-[#6D35C8] hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <div>
                    <label className="text-[11px] text-zinc-600 uppercase font-bold mb-1 block">Your Name</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Fahim Shahriar"
                      className="w-full bg-[#F7F7F5] border border-zinc-300 rounded-xl px-3 py-2 text-xs text-[#1F2024] focus:outline-none focus:border-[#6D35C8]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-zinc-600 uppercase font-bold mb-1 block">Phone (WhatsApp)</label>
                      <input
                        type="tel"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full bg-[#F7F7F5] border border-zinc-300 rounded-xl px-3 py-2 text-xs text-[#1F2024] font-mono focus:outline-none focus:border-[#6D35C8]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-600 uppercase font-bold mb-1 block">Email (Optional)</label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="name@mail.com"
                        className="w-full bg-[#F7F7F5] border border-zinc-300 rounded-xl px-3 py-2 text-xs text-[#1F2024] focus:outline-none focus:border-[#6D35C8]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-600 uppercase font-bold mb-1 block">Message</label>
                    <textarea
                      required
                      rows={3}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Tell us what kit you need or ask any questions..."
                      className="w-full bg-[#F7F7F5] border border-zinc-300 rounded-xl p-3 text-xs text-[#1F2024] focus:outline-none focus:border-[#6D35C8]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#6D35C8] hover:bg-[#4B218A] text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-md shadow-purple-900/20 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. FAQ PAGE */}
      {page === 'faq' && (
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold text-[#6D35C8] uppercase tracking-widest">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h1 className="font-display text-4xl font-black text-[#1F2024] uppercase tracking-tight">
              Customer Help & FAQs
            </h1>
          </div>

          <div className="space-y-3">
            {(faqList.length > 0 ? faqList.map((f) => ({ q: f.question, a: f.answer })) : defaultFaqs).map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-white border border-[#E5E5E3] overflow-hidden transition shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[#1F2024] hover:text-[#6D35C8] transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180 text-[#6D35C8]' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-zinc-600 leading-relaxed border-t border-[#E5E5E3] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. RETURNS & EXCHANGES */}
      {page === 'returns' && (
        <div className="space-y-6">
          <h1 className="font-display text-3xl sm:text-4xl font-black text-[#1F2024] uppercase">
            {cmsPage?.title || '7 Days Exchange & Return Policy'}
          </h1>
          <div className="p-8 rounded-3xl bg-white border border-[#E5E5E3] space-y-4 text-xs sm:text-sm text-zinc-700 leading-relaxed shadow-sm">
            {cmsPage?.content ? (
              <div className="whitespace-pre-line">{cmsPage.content}</div>
            ) : (
              <>
                <h3 className="font-bold text-[#6D35C8] uppercase">Size Replacement Guarantee</h3>
                <p>
                  We want you to have the perfect match fit. If the jersey you received is too snug or loose, you can initiate a size exchange within <strong>7 days</strong> of parcel arrival.
                </p>
                <h3 className="font-bold text-[#6D35C8] uppercase pt-2">Eligibility Conditions</h3>
                <ul className="list-disc pl-5 space-y-1 text-zinc-600">
                  <li>Garment must have original tags attached and packaging intact.</li>
                  <li>Item must be unworn, unwashed, and without damage.</li>
                  <li>Customized jerseys with personal custom names are eligible for exchange in case of printing error or fabric defect.</li>
                </ul>
              </>
            )}
          </div>
        </div>
      )}

      {/* 5. TERMS & CONDITIONS */}
      {page === 'terms' && (
        <div className="space-y-6">
          <h1 className="font-display text-3xl sm:text-4xl font-black text-[#1F2024] uppercase">
            {cmsPage?.title || 'Terms & Conditions'}
          </h1>
          <div className="p-8 rounded-3xl bg-white border border-[#E5E5E3] space-y-4 text-xs sm:text-sm text-zinc-600 leading-relaxed shadow-sm">
            {cmsPage?.content ? (
              <div className="whitespace-pre-line">{cmsPage.content}</div>
            ) : (
              <>
                <p>
                  By accessing and purchasing from {settings.store_name || 'RAYVEN'} Football Sportswear, you agree to the sales terms, delivery covenants, and exchange policies governed under Bangladeshi consumer trade regulations.
                </p>
                <p>
                  Prices, promotions, and inventory availability are subject to change without prior notice. All orders placed via Cash on Delivery are verified by our team before courier handover.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* 6. PRIVACY POLICY */}
      {page === 'privacy' && (
        <div className="space-y-6">
          <h1 className="font-display text-3xl sm:text-4xl font-black text-[#1F2024] uppercase">
            {cmsPage?.title || 'Privacy Policy'}
          </h1>
          <div className="p-8 rounded-3xl bg-white border border-[#E5E5E3] space-y-4 text-xs sm:text-sm text-zinc-600 leading-relaxed shadow-sm">
            {cmsPage?.content ? (
              <div className="whitespace-pre-line">{cmsPage.content}</div>
            ) : (
              <>
                <p>
                  {settings.store_name || 'RAYVEN'} respects customer data privacy. Your contact details, phone numbers, and delivery addresses are used exclusively for fulfilling parcel shipments and tracking updates.
                </p>
                <p>
                  We do not sell, rent, or trade your personal data to any external advertising aggregators.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
