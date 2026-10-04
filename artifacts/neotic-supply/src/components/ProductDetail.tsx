import { useRef } from 'react';
import { useOverlay } from './useOverlay';
import { productImageSources } from '../lib/product-images';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import '../product-detail.css';

export type DetailProduct = {
  id: string; name: string; character: string; characterNumber: string;
  color: string; tagline: string; availability: string; price: number; image: string;
};
type Props = {
  product: DetailProduct;
  imageSrc: string;
  selectedSize: string;
  sizes: string[];
  onSelectSize: (size: string) => void;
  onAddToBag: () => void;
  onClose: () => void;
  onBackToShop: () => void;
};
const details = ['Oversized fit', 'Premium heavyweight cotton', 'Character graphic', 'NEOTIC SUPPLY branding', 'DROP 001'];

export default function ProductDetail({ product, imageSrc, selectedSize, sizes, onSelectSize, onAddToBag, onClose, onBackToShop }: Props) {
  const root = useRef<HTMLDivElement>(null);
  useOverlay(root, onClose, '#product-detail-close');

  return (
    <div className="pd-root" ref={root} role="dialog" aria-modal="true" aria-labelledby="product-detail-title" data-testid={`product-detail-${product.id}`}>
      <div className="pd-bar">
        <button type="button" className="pd-back" id="product-back-shop" data-testid="product-back-shop" onClick={onBackToShop}><ArrowLeft size={14} /> BACK TO SHOP</button>
        <span className="pd-bar-mid">NEOTIC SUPPLY / CHARACTER {product.characterNumber}</span>
        <button type="button" className="pd-close" id="product-detail-close" aria-label="Close product details" data-testid="product-detail-close" onClick={onClose}><X size={18} /></button>
      </div>
      <div className="pd-scroll">
        <div className="pd-grid">
          <div className="pd-stage">
            <span className="pd-ghost" aria-hidden="true">{product.character}</span>
            <span className="pd-index" aria-hidden="true">{product.characterNumber} / 004</span>
            <img className="pd-img" src={imageSrc} srcSet={productImageSources(imageSrc)} sizes="(max-width:900px) 90vw, 640px" decoding="async" alt={`${product.name}, official ${product.color.toLowerCase()} NEOTIC SUPPLY tee`} />
          </div>
          <div className="pd-info">
            <span className="pd-brand">NEOTIC SUPPLY</span>
            <h2 className="display pd-title" id="product-detail-title">{product.name}</h2>
            <p className="pd-tag">{product.characterNumber} / {product.tagline}</p>
            <div className="pd-price-row">
              <strong>${product.price.toFixed(2)}</strong>
              <span className="pd-avail"><i aria-hidden="true" />{product.availability}</span>
            </div>
            <p className="pd-color">COLOR / {product.color}</p>
            <div className="pd-sizes">
              <div className="pd-label"><span>SIZE</span><span>{selectedSize}</span></div>
              <div className="pd-size-row" role="group" aria-label={`Select size for ${product.name}`}>
                {sizes.map((size) => (
                  <button type="button" key={size} className={`pd-size ${selectedSize === size ? 'is-on' : ''}`} aria-pressed={selectedSize === size} id={`detail-size-${product.id}-${size.toLowerCase()}`} data-testid={`detail-size-${product.id}-${size.toLowerCase()}`} onClick={() => onSelectSize(size)}>{size}</button>
                ))}
              </div>
            </div>
            <button type="button" className="pd-add" id={`detail-add-${product.id}`} data-testid={`detail-add-${product.id}`} onClick={onAddToBag}>ADD TO BAG <ArrowRight size={16} /></button>
            <section className="pd-block">
              <h3 className="pd-label">DESCRIPTION</h3>
              <p>{product.character} — {product.tagline}.<br />A character-driven graphic tee from DROP 001.</p>
            </section>
            <section className="pd-block">
              <h3 className="pd-label">DETAILS</h3>
              <ul>{details.map((d) => <li key={d}>{d}</li>)}</ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
