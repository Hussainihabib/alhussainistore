import { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { usePageMeta } from "../hooks/usePageMeta";

function ProductRow({
  title,
  viewMoreHref,
  products,
}) {
  if (!products?.length) return null;

  return (
    <section className="container py-10 sm:py-14">

      <div className="flex justify-between items-center gap-4">

        <h2 className="text-xl sm:text-2xl font-serif">
          {title}
        </h2>

        <Link
          to={viewMoreHref}
          className="text-brand text-sm whitespace-nowrap font-medium"
        >
          View More
        </Link>

      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6">

        {products
          .slice(0, 4)
          .map((product) => (

            <ProductCard
              key={product._id}
              p={product}
            />

          ))}

      </div>

    </section>
  );
}

export default function Home() {
  usePageMeta(
    "Kids Clothing Online in Pakistan",
    "Shop quality kids clothing, everyday wear and special occasion outfits, with nationwide delivery and Cash on Delivery."
  );

  const [featured, setFeatured] =
    useState([]);

  const [bestSellers, setBestSellers] =
    useState([]);

  const [newArrivals, setNewArrivals] =
    useState([]);

  const [cats, setCats] =
    useState([]);

  const [banners, setBanners] =
    useState([]);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [
          featuredResponse,
          bestSellerResponse,
          newArrivalResponse,
          categoryResponse,
          bannerResponse,
        ] = await Promise.all([
          api.get(
            "/products?featured=true&limit=4"
          ),

          api.get(
            "/products?bestSeller=true&limit=4"
          ),

          api.get(
            "/products?sort=newest&limit=4"
          ),

          api.get(
            "/categories"
          ),

          api.get(
            "/admin-public/banners"
          ),
        ]);

        /*
          FEATURED PRODUCTS
        */

        setFeatured(
          featuredResponse.data?.products ||
            featuredResponse.data ||
            []
        );

        /*
          BEST SELLERS
        */

        setBestSellers(
          bestSellerResponse.data?.products ||
            bestSellerResponse.data ||
            []
        );

        /*
          NEW ARRIVALS
        */

        setNewArrivals(
          newArrivalResponse.data?.products ||
            newArrivalResponse.data ||
            []
        );

        /*
          CATEGORIES

          Supports:
          []
          OR
          { categories: [] }
        */

        const categoryData =
          Array.isArray(
            categoryResponse.data
          )
            ? categoryResponse.data
            : categoryResponse.data
                ?.categories || [];

        setCats(
          categoryData
            .filter(
              (category) =>
                category.isActive !==
                false
            )
            .sort(
              (a, b) =>
                (a.sortOrder || 0) -
                (b.sortOrder || 0)
            )
        );

        /*
          BANNERS

          Supports:
          []
          OR
          { banners: [] }
        */

        const bannerData =
          Array.isArray(
            bannerResponse.data
          )
            ? bannerResponse.data
            : bannerResponse.data
                ?.banners || [];

        setBanners(
          bannerData
            .filter(
              (banner) =>
                banner.isActive !==
                false &&
                banner.image
            )
            .sort(
              (a, b) =>
                (a.sortOrder || 0) -
                (b.sortOrder || 0)
            )
        );
      } catch (error) {
        console.error(
          "Home data loading error:",
          error
        );
      }
    };

    loadHomeData();
  }, []);

  /*
    FIRST BANNER
  */

  const hero = banners[0];

  /*
    ONLY MAIN CATEGORIES

    parent can be:
    null
    empty
    object
    MongoDB ID
  */

  const mainCategories =
    cats.filter((category) => {
      if (!category.parent) {
        return true;
      }

      return false;
    });

  return (
    <>

      {/* HERO SECTION */}

      <section className="bg-brand text-white overflow-hidden">

        {hero ? (

          <div className="container min-h-[380px] sm:min-h-[430px] grid md:grid-cols-2 items-center gap-8 py-10">

            <div>

              <p className="text-gold tracking-[0.25em] text-xs">
                AL-HUSSAINI GARMENTS
              </p>

              <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif mt-4 leading-tight">
                {hero.title}
              </h1>

              {hero.subtitle && (

                <p className="mt-5 text-white/80 max-w-lg">
                  {hero.subtitle}
                </p>

              )}

              <Link
                className="btn-gold mt-7 inline-block"
                to={
                  hero.buttonLink ||
                  "/shop"
                }
              >
                {hero.buttonText ||
                  "SHOP NOW"}
              </Link>

            </div>

            <img
              src={hero.image}
              alt={
                hero.title ||
                "Al-Hussaini Garments"
              }
              className="w-full max-w-xl justify-self-end h-[260px] sm:h-[380px] object-cover rounded-3xl border border-gold/40"
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />

          </div>

        ) : (

          <div className="container min-h-[380px] sm:min-h-[430px] grid md:grid-cols-2 items-center gap-8 py-10">

            <div>

              <p className="text-gold tracking-[0.3em] text-xs">
                AL-HUSSAINI GARMENTS
              </p>

              <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif mt-4 leading-tight">

                KIDS{" "}

                <span className="text-gold">
                  COLLECTION
                </span>

              </h1>

              <p className="mt-5 text-white/80 max-w-lg">
                Premium quality clothing
                for boys and girls.
              </p>

              <Link
                className="btn-gold mt-7 inline-block"
                to="/shop"
              >
                SHOP COLLECTION
              </Link>

            </div>

          </div>

        )}

      </section>

      {/* EXTRA BANNERS */}

      {banners.length > 1 && (

        <section className="container py-8 grid sm:grid-cols-2 gap-5">

          {banners
            .slice(1)
            .map((banner) => (

              <Link
                key={
                  banner._id ||
                  banner.id
                }
                to={
                  banner.buttonLink ||
                  "/shop"
                }
                className="card overflow-hidden relative min-h-48 sm:min-h-56 group"
              >

                <img
                  src={banner.image}
                  alt={
                    banner.title ||
                    "Promotion"
                  }
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />

                <div className="absolute inset-0 bg-black/40 p-5 sm:p-6 text-white flex flex-col justify-end">

                  <h2 className="text-xl sm:text-2xl font-serif">
                    {banner.title}
                  </h2>

                  {banner.subtitle && (

                    <p className="text-sm mt-1 text-white/90">
                      {
                        banner.subtitle
                      }
                    </p>

                  )}

                </div>

              </Link>

            ))}

        </section>

      )}

      {/* SHOP BY CATEGORY */}

      <section className="container py-10 sm:py-14">

        <div className="flex justify-between items-end gap-4">

          <h2 className="text-xl sm:text-2xl font-serif">
            SHOP BY CATEGORY
          </h2>

          <Link
            to="/shop"
            className="text-brand text-sm font-medium whitespace-nowrap"
          >
            View All
          </Link>

        </div>

        {mainCategories.length > 0 ? (

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6">

            {mainCategories.map(
              (category) => (

                <Link
                  key={
                    category._id
                  }
                  to={`/shop?category=${category._id}`}
                  className="card overflow-hidden relative min-h-36 sm:min-h-44 bg-brand text-white p-4 sm:p-5 flex items-end group"
                >

                  {category.image ? (

                    <img
                      src={
                        category.image
                      }
                      alt={
                        category.name
                      }
                      className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-110"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />

                  ) : (

                    <div className="absolute inset-0 bg-brand" />

                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <div className="relative z-10">

                    <b className="text-lg sm:text-xl">
                      {category.name}
                    </b>

                    <span className="block text-gold text-xs mt-1">
                      Shop Now →
                    </span>

                  </div>

                </Link>

              )
            )}

          </div>

        ) : (

          <div className="mt-6 py-10 text-center card">

            <p className="text-stone-500">
              No categories available yet.
            </p>

            <Link
              to="/shop"
              className="btn-brand inline-block mt-4"
            >
              SHOP ALL PRODUCTS
            </Link>

          </div>

        )}

      </section>

      {/* FEATURED PRODUCTS */}

      <ProductRow
        title="FEATURED PRODUCTS"
        viewMoreHref="/shop?featured=true"
        products={featured}
      />

      {/* BEST SELLERS */}

      <ProductRow
        title="BEST SELLERS"
        viewMoreHref="/shop?bestSeller=true"
        products={bestSellers}
      />

      {/* NEW ARRIVALS */}

      <ProductRow
        title="NEW ARRIVALS"
        viewMoreHref="/shop?sort=newest"
        products={newArrivals}
      />

    </>
  );
}