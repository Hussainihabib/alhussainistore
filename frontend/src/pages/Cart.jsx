import { Link, useNavigate } from "react-router-dom";

import { useStore } from "../context/StoreContext";


export default function Cart() {

  const {
    cart,
    setCart,
    user,
  } = useStore();


  const navigate = useNavigate();


  const safeCart = Array.isArray(cart)
    ? cart
    : [];


  const total = safeCart.reduce(
    (sum, item) => {

      const price = Number(
        item?.product?.sellingPrice || 0
      );

      const quantity = Number(
        item?.quantity || 1
      );

      return sum + price * quantity;

    },
    0
  );


  const updateQuantity = (index, value) => {

    const quantity = Math.max(
      1,
      Number(value) || 1
    );


    setCart(
      safeCart.map(
        (item, itemIndex) =>

          itemIndex === index
            ? {
                ...item,
                quantity,
              }
            : item
      )
    );

  };


  const removeItem = (index) => {

    setCart(
      safeCart.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );

  };


  const handleCheckout = () => {

    if (safeCart.length === 0) {
      return;
    }


    /*
      Customer logged in
    */

    if (user?.role === "customer") {

      navigate("/checkout");

      return;

    }


    /*
      Customer not logged in

      Login page ke baad automatically
      checkout par wapas ayega.
    */

    navigate(
      "/login?redirect=" +
      encodeURIComponent("/checkout")
    );

  };


  return (

    <div className="container py-10 grid lg:grid-cols-[1fr_360px] gap-7">


      {/* =========================
          CART ITEMS
      ========================== */}

      <div>

        <h1 className="text-3xl font-serif mb-5">
          YOUR CART
        </h1>


        {safeCart.length > 0 ? (

          <div className="space-y-3">

            {safeCart.map(
              (item, index) => {

                const product =
                  item?.product || {};


                const price = Number(
                  product?.sellingPrice || 0
                );


                const variant =
                  (
                    product?.variants || []
                  ).find(
                    (v) =>
                      v._id === item?.variantId
                  );


                return (

                  <div

                    key={
                      `${product?._id || "product"}-${item?.variantId || index}-${index}`
                    }

                    className="
                      card
                      p-4
                      flex
                      flex-col
                      sm:flex-row
                      gap-4
                    "

                  >


                    {/* PRODUCT IMAGE */}

                    <img

                      className="
                        w-full
                        sm:w-20
                        h-48
                        sm:h-24
                        object-cover
                        rounded-lg
                        bg-stone-100
                      "

                      src={
                        product?.images?.[0]?.url ||
                        "https://placehold.co/300x400/F8F9FA/581845?text=Product"
                      }

                      alt={
                        product?.name ||
                        "Product"
                      }

                    />


                    {/* PRODUCT DETAILS */}

                    <div className="flex-1">

                      <b className="text-lg">

                        {product?.name ||
                          "Product"}

                      </b>


                      {variant && (

                        <p className="text-sm text-stone-500 mt-1">

                          Size:{" "}

                          {variant.size ||
                            "N/A"}

                          {" · "}

                          Color:{" "}

                          {variant.color ||
                            "N/A"}

                        </p>

                      )}


                      <p className="text-brand font-bold mt-2">

                        PKR{" "}

                        {price.toLocaleString()}

                      </p>

                    </div>


                    {/* QUANTITY */}

                    <div

                      className="
                        flex
                        sm:flex-col
                        items-center
                        sm:items-end
                        justify-between
                        gap-3
                      "

                    >

                      <input

                        className="
                          field
                          w-20
                          h-10
                          text-center
                        "

                        type="number"

                        min="1"

                        value={
                          item?.quantity || 1
                        }

                        onChange={
                          (event) =>

                            updateQuantity(
                              index,
                              event.target.value
                            )
                        }

                      />


                      <button

                        type="button"

                        className="
                          text-red-600
                          font-medium
                          hover:underline
                        "

                        onClick={
                          () =>
                            removeItem(index)
                        }

                      >

                        Remove

                      </button>

                    </div>

                  </div>

                );

              }
            )}

          </div>

        ) : (

          <div className="card p-8 text-center">

            <p className="text-stone-600">
              Your cart is empty.
            </p>


            <Link

              className="
                text-brand
                underline
                mt-3
                inline-block
              "

              to="/shop"

            >

              Shop now

            </Link>

          </div>

        )}

      </div>


      {/* =========================
          ORDER SUMMARY
      ========================== */}

      <aside

        className="
          card
          p-6
          h-fit
          lg:sticky
          lg:top-24
        "

      >

        <h2 className="font-serif text-xl">
          ORDER SUMMARY
        </h2>


        <div className="flex justify-between mt-5 gap-4">

          <span>
            Subtotal
          </span>


          <b>

            PKR{" "}

            {total.toLocaleString()}

          </b>

        </div>


        <p className="text-xs text-stone-500 mt-3">

          Shipping and coupon discount will be
          calculated at checkout.

        </p>


        {/* LOGIN MESSAGE */}

        {user?.role !== "customer" && (

          <p className="text-xs text-stone-500 mt-3">

            Please login to continue with checkout.

          </p>

        )}


        <button

          type="button"

          disabled={
            safeCart.length === 0
          }

          onClick={handleCheckout}

          className="
            btn-brand
            w-full
            mt-6
            disabled:opacity-50
            disabled:cursor-not-allowed
          "

        >

          {user?.role === "customer"

            ? "PROCEED TO CHECKOUT"

            : "LOGIN TO CHECKOUT"

          }

        </button>

      </aside>

    </div>

  );

}