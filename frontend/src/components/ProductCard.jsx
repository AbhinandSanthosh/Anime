import { Heart, ShoppingBag } from "lucide-react";

const ProductCard = ({ product }) => (
  <article className="group min-w-0">
    <div className="relative aspect-[.84] overflow-hidden rounded-2xl bg-[#111018]">
      <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-70" />
      {product.badge && <span className="absolute left-3 top-3 rounded-full bg-violet-600 px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-[1px] sm:left-4 sm:top-4">{product.badge}</span>}
      <button aria-label="Add to wishlist" className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-white hover:text-black sm:right-4 sm:top-4 sm:h-10 sm:w-10">
        <Heart size={16} strokeWidth={1.8} />
      </button>
      <button className="absolute bottom-3 left-3 right-3 hidden translate-y-2 items-center justify-center gap-2 rounded-xl bg-white py-3 text-[10px] font-extrabold text-black opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 sm:flex">
        <ShoppingBag size={15} /> ADD TO CART
      </button>
    </div>
    <div className="pt-4">
      <p className="mb-1 text-[9px] font-bold uppercase tracking-[1.8px] text-violet-400">{product.category}</p>
      <h3 className="line-clamp-1 text-sm font-semibold text-white sm:text-[15px]">{product.name}</h3>
      <div className="mt-1.5 flex items-center gap-2">
        <span className="text-sm font-bold">₹{product.price}</span>
        {product.originalPrice && <span className="text-xs text-zinc-600 line-through">₹{product.originalPrice}</span>}
      </div>
    </div>
  </article>
);

export default ProductCard;
