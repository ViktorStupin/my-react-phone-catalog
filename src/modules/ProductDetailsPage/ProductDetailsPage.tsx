/* eslint-disable max-len */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/indent */
import { useLocation, useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../../components/Breadcrumb';
import styles from './ProductDetailsPage.module.scss';
import {
  findAccessory,
  findPhone,
  findTablet,
  getAccessories,
  getPhones,
  getProducts,
  getTablets,
} from '../Base/services/ProductService';
import { AccessoryDetails } from '../../types/AccessoryDetails';
import { useEffect, useState, useRef } from 'react';
import { AddToCart } from '../../components/AddToCart';
import { LikeButton } from '../../components/LikeButton/LikeButton';
import { getFormattedCapacity } from '../Base/utils/getFormattedCapacity';
import { ProductDetails } from '../../types/ProductDetails';
import { ProductsSlider } from '../../components/ProductsSlider';
import { getColor } from '../Base/utils/getColor';
import { useAppState, useAppDispatch } from '../../Context/AppContext';
import { Loader } from '../../components/Loader';
import { Back } from '../../components/Back';
import { getTranslation } from '../Base/utils/getTranslation';
import { getAssetPath } from '../Base/utils/getAssetPath';

export const ProductDetailsPage: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { cartProducts, favouriteProducts, products, language } = useAppState();
  const { toggleFavouriteCard, toggleAddToCart } = useAppDispatch();
  const t = getTranslation(language);

  const [product, setProduct] = useState<
    ProductDetails | AccessoryDetails | undefined
  >(undefined);
  const [similarProducts, setSimilarProducts] = useState<
    ProductDetails[] | AccessoryDetails[] | undefined
  >(undefined);
  const [isProductLoading, setIsProductLoading] = useState(true);
  const [currentPicture, setCurrentPicture] = useState('');
  const [currentCapacity, setCurrentCapacity] = useState('');
  const [currentColor, setCurrentColor] = useState('');

  const handleSwipeLeft = () => {
    if (product && product.images.length > 1) {
      const currentIndex = product.images.indexOf(currentPicture);
      const nextIndex =
        currentIndex === product.images.length - 1 ? 0 : currentIndex + 1;

      setCurrentPicture(product.images[nextIndex]);
    }
  };

  const handleSwipeRight = () => {
    if (product && product.images.length > 1) {
      const currentIndex = product.images.indexOf(currentPicture);
      const prevIndex =
        currentIndex === 0 ? product.images.length - 1 : currentIndex - 1;

      setCurrentPicture(product.images[prevIndex]);
    }
  };

  const sliderRef = useRef<HTMLUListElement>(null);
  const touchStartX = useRef(0);
  const currentTranslate = useRef(0);
  const previousTranslate = useRef(0);
  const isSwiping = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    isSwiping.current = true;
    touchStartX.current = e.targetTouches[0].clientX;

    const currentIndex = product ? product.images.indexOf(currentPicture) : 0;

    previousTranslate.current = -currentIndex * 100;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping.current) {
      return;
    }

    const deltaX = e.targetTouches[0].clientX - touchStartX.current;
    const containerWidth = sliderRef.current?.offsetWidth || 0;

    const percentageDelta = (deltaX / containerWidth) * 100;

    currentTranslate.current = previousTranslate.current + percentageDelta;

    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(${currentTranslate.current}%)`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isSwiping.current) {
      return;
    }

    isSwiping.current = false;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX.current;
    const threshold = 50;

    if (Math.abs(deltaX) > threshold) {
      if (deltaX < 0) {
        handleSwipeLeft();
      } else {
        handleSwipeRight();
      }
    } else {
      if (sliderRef.current) {
        const currentIndex = product
          ? product.images.indexOf(currentPicture)
          : 0;

        sliderRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
      }
    }
  };

  useEffect(() => {
    if (!product) {
      setIsProductLoading(true);
    }

    let isMounted = true;

    const fetchProduct = async () => {
      try {
        const itemId = pathname.split('/')[2];
        const fetchedProducts = await getProducts();
        const item = fetchedProducts.find(item => item.itemId === itemId);

        if (!item) {
          if (isMounted) {
            setProduct(undefined);
            setIsProductLoading(false);
          }

          return;
        }

        let response: ProductDetails | AccessoryDetails | undefined;
        let similar: ProductDetails[] | AccessoryDetails[] | undefined;

        switch (item.category) {
          case 'phones': {
            response = await findPhone('id', item.itemId);
            const phones = await getPhones();

            similar = phones.filter(
              (p: ProductDetails) =>
                p.namespaceId === (response as ProductDetails).namespaceId,
            );
            break;
          }

          case 'tablets': {
            const tablets = await getTablets();

            response = await findTablet('id', item.itemId);
            similar = tablets.filter(
              (p: ProductDetails) =>
                p.namespaceId === (response as ProductDetails).namespaceId,
            );
            break;
          }

          case 'accessories': {
            const accessories = await getAccessories();

            response = await findAccessory('id', item.itemId);
            similar = accessories.filter(
              (p: AccessoryDetails) =>
                p.namespaceId === (response as AccessoryDetails).namespaceId,
            );
            break;
          }

          default:
            response = undefined;
        }

        if (isMounted) {
          setProduct(response);
          setSimilarProducts(similar);
          setIsProductLoading(false);
        }
      } catch {
        if (isMounted) {
          setProduct(undefined);
          setIsProductLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [pathname, products]);

  useEffect(() => {
    if (product) {
      setCurrentCapacity(product.capacity);
      setCurrentColor(product.color);
      setCurrentPicture(product.images[0]);

      navigate(`/${product.category}/${product.id}`, { replace: true });
    }
  }, [product, navigate]);

  if (isProductLoading || !products || products.length === 0) {
    return (
      <main className={`${styles.main} ${styles.isLoading}`}>
        <Loader />
      </main>
    );
  }

  return (
    <main
      className={`${styles.main} ${isProductLoading ? styles.isLoading : ''}`}
    >
      {product ? (
        <>
          <div className={styles.head}>
            <Breadcrumb />
            <Back />

            <div className={styles.product}>
              <h3 className={styles.title}>{product.name}</h3>

              <div className={styles.pictures}>
                <div className={styles.picturesList}>
                  {product.images.map((url: string) => (
                    <div
                      onClick={() => setCurrentPicture(url)}
                      key={url}
                      className={`
                        ${styles.picture}
                        ${currentPicture === url ? styles.pictureActive : ''}
                      `}
                    >
                      <img
                        className={styles.img}
                        src={getAssetPath(url)}
                        alt="Phone"
                      />
                    </div>
                  ))}
                </div>

                <div
                  className={styles.currentPicture}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <ul
                    ref={sliderRef}
                    className={styles.currentPictureList}
                    style={{
                      transform: `translateX(-${product.images.indexOf(currentPicture) * 100}%)`,
                    }}
                  >
                    {product.images.map(url => (
                      <li key={url} className={styles.currentPictureItem}>
                        <img
                          src={getAssetPath(url)}
                          className={styles.img}
                          alt="Image"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={styles.mainInfo}>
                <div className={styles.colors}>
                  <div className={styles.colorsTitle}>
                    <span className="smallText">
                      {t.productDetailsPage.availableColors}
                    </span>
                    <span className={`${styles.colorsId} smallText`}>
                      ID: {Math.floor(100000 + Math.random() * 900000)}
                    </span>
                  </div>

                  <ul className={styles.colorsList}>
                    {product.colorsAvailable.map(item => (
                      <li
                        onClick={() =>
                          setProduct(
                            similarProducts!.find(
                              p =>
                                p.color === item &&
                                p.capacity === currentCapacity,
                            ),
                          )
                        }
                        className={`
                            ${styles.colorsItem}
                            ${currentColor === item ? styles.colorsItemActive : ''}
                          `}
                        key={item}
                      >
                        <div
                          style={{ backgroundColor: getColor(item) }}
                          className={styles.colorsItemColor}
                        ></div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.line}></div>

                <div className={styles.capacity}>
                  <span className="smallText">
                    {t.productDetailsPage.selectCapacity}
                  </span>

                  <ul className={`${styles.capacityList} bodyText`}>
                    {product.capacityAvailable.map(item => (
                      <li
                        onClick={() =>
                          setProduct(
                            similarProducts!.find(
                              p =>
                                p.capacity === item && p.color === currentColor,
                            ),
                          )
                        }
                        className={`
                            ${styles.capacityItem}
                            ${currentCapacity === item ? styles.capacityItemActive : ''}
                          `}
                        key={item}
                      >
                        {getFormattedCapacity(item)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.line}></div>

                <div className={styles.order}>
                  <h4 className={styles.price}>
                    ${product.priceDiscount}{' '}
                    <span className={styles.fullPrice}>
                      ${product.priceRegular}
                    </span>
                  </h4>

                  <div className={styles.buttons}>
                    <AddToCart
                      isActive={Object.keys(cartProducts).includes(product.id)}
                      onClick={() => toggleAddToCart(product.id)}
                    />
                    <LikeButton
                      isSelected={favouriteProducts.includes(product.id)}
                      onClick={() => toggleFavouriteCard(product.id)}
                    />
                  </div>
                </div>

                <div className={styles.info}>
                  <ul className={`${styles.keys} smallText`}>
                    <li>{t.productDetailsPage.screen}</li>
                    <li>{t.productDetailsPage.resolution}</li>
                    <li>{t.productDetailsPage.processor}</li>
                    <li>{t.productDetailsPage.ram}</li>
                  </ul>

                  <ul className={`${styles.values} cardValuesText`}>
                    <li>{product.screen}</li>
                    <li>{product.resolution}</li>
                    <li>{product.processor}</li>
                    <li>{getFormattedCapacity(product.ram)}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.about}>
            <div>
              <h4 className={styles.aboutTitle}>
                {t.productDetailsPage.about}
              </h4>
              <div className={styles.line}></div>
            </div>

            {product.description.map(item => (
              <div className={styles.aboutItem} key={item.title}>
                <h5 className={styles.aboutSubtitle}>{item.title}</h5>

                {item.text.map(text => (
                  <p className={`${styles.aboutText} bodyText`} key={text}>
                    {text}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <div className={styles.techSpecs}>
            <div>
              <h4 className={styles.techSpecsTitle}>
                {t.productDetailsPage.techSpecs}
              </h4>
              <div className={styles.line}></div>
            </div>

            <ul className={`${styles.techSpecsList} bodyText`}>
              <li className={styles.case}>
                {t.productDetailsPage.screen}{' '}
                <span className={styles.value}>{product.screen}</span>
              </li>
              <li className={styles.case}>
                {t.productDetailsPage.resolution}{' '}
                <span className={styles.value}>{product.resolution}</span>
              </li>
              <li className={styles.case}>
                {t.productDetailsPage.processor}{' '}
                <span className={styles.value}>{product.processor}</span>
              </li>
              <li className={styles.case}>
                {t.productDetailsPage.ram}{' '}
                <span className={styles.value}>
                  {getFormattedCapacity(product.ram)}
                </span>
              </li>
              <li className={styles.case}>
                {t.productDetailsPage.builtInMemory}{' '}
                <span className={styles.value}>
                  {getFormattedCapacity(product.capacity)}
                </span>
              </li>
              {'camera' in product && (
                <>
                  <li className={styles.case}>
                    {t.productDetailsPage.camera}{' '}
                    <span className={styles.value}>{product.camera}</span>
                  </li>
                  <li className={styles.case}>
                    {t.productDetailsPage.zoom}{' '}
                    <span className={styles.value}>{product.zoom}</span>
                  </li>
                </>
              )}
              <li className={styles.case}>
                {t.productDetailsPage.cell}{' '}
                <span className={styles.value}>{product.cell.join(', ')}</span>
              </li>
            </ul>
          </div>

          <ProductsSlider
            title={t.productDetailsPage.youMayAlsoLike}
            filter="random"
          />
        </>
      ) : (
        <div className={styles.head}>
          <Breadcrumb />
          <Back />

          <h2 className={styles.title}>
            {t.productDetailsPage.productNotFound}
          </h2>
        </div>
      )}
    </main>
  );
};
