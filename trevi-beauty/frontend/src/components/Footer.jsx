import { Link } from 'react-router-dom'
import { Sparkles, Instagram, Facebook, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#3e220d] text-white/70 mt-24">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-blush-400" />
              <span className="font-display text-2xl font-bold text-white">Trevi Beauty</span>
            </div>
            <p className="font-accent text-lg italic text-white/60 mb-6">Timeless Beauty.</p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:border-blush-400 hover:text-blush-400 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              {['Lipstick', 'Foundation', 'Skincare', 'Fragrance', 'Brushes'].map(l => (
                <li key={l}><Link to={`/shop?search=${l}`} className="text-sm hover:text-blush-300 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-white font-semibold mb-4">Help</h4>
            <ul className="space-y-2">
              {['FAQ', 'Shipping & Returns', 'Track Your Order', 'Contact Us'].map(l => (
                <li key={l}><a href="#" className="text-sm hover:text-blush-300 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-white font-semibold mb-4">Newsletter</h4>
            <p className="text-sm mb-4">Get beauty tips and exclusive offers.</p>
            <div className="flex rounded-full overflow-hidden border border-white/20">
              <input type="email" placeholder="Your email" className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none placeholder-white/30" />
              <button className="gradient-rose px-4 py-2.5 text-sm font-medium text-white">Join</button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs">© 2025 Trevi Beauty. All rights reserved.</p>
          <p className="text-xs">Built with ❤️ for beauty lovers everywhere.</p>
        </div>
      </div>
    </footer>
  )
}
