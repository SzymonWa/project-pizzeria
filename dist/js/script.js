/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();  
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      
    }
    renderInMenu(){
      const thisProduct = this;
      const generatedHTML = templates.menuProduct(thisProduct.data);
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      const menuContainer = document.querySelector(select.containerOf.menu);
      menuContainer.appendChild(thisProduct.element);
    }
    getElements(){
      const thisProduct = this;
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      
    }
    initAccordion(){
      const thisProduct = this;
      
      /* find the clickable trigger (the element that should react to clicking) */
      
      
      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function(event) {
      /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
        const activeProduct = document.querySelector('.active');
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if(activeProduct){
          if(activeProduct !== thisProduct.element){
            activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
          }  
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }
    initOrderForm(){
      const thisProduct = this;
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
    
    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('update',function(){
        thisProduct.processOrder();
      });
    }

    processOrder() {
      const thisProduct = this;
      
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      
    
      // set price to default price
      let price = thisProduct.data.price;
    
      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        
    
        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          
          const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          
          if(optionSelected) {
            // check if the option is not default
            if(!option.default) {
              // add option price to price variable
              price = price + option.price;
            }
          } else {
            // check if the option is default
            if(option.default) {
              // reduce price variable
              price = price - option.price;
            }
          } 
          if(optionImage) {
            if(optionSelected) {            
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            } else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            } 
          }
            
          // check if there is param with a name of paramId in formData and if it includes optionId
          
        }
    
        // update calculated price in the HTML
        
      }
      price *= thisProduct.amountWidget.value;
      thisProduct.priceSingle = price;
      thisProduct.priceElem.innerHTML = price;
    }
    
    addToCart(){
      const thisProduct = this;
      app.cart.add(thisProduct.prepareCartProduct());
      
    }
    prepareCartProduct(){
      const thisProduct = this;
      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle * thisProduct.amountWidget.value,
        params: thisProduct.prepareCartProductParams(),
      };
      
      return productSummary;
    }
    prepareCartProductParams() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
    
        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {}
        }
    
        // for every option in this category
        for(let optionId in param.options) {
          
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
    
          if(optionSelected) {
            const optionLabel = param.options[optionId].label;
            params[paramId].options[optionId] = optionLabel;
          }
        }
      }
      
      return params;
    }
  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
    }
    getElements(element){
      const thisWidget = this;
    
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);


      if(thisWidget.value !== newValue && !isNaN(newValue) && newValue <= settings.amountWidget.defaultMax && newValue >= settings.amountWidget.defaultMin) {
        

        thisWidget.value = newValue;
        thisWidget.announce();
 
      }
      

      thisWidget.input.value = thisWidget.value;
    }
    initActions(){
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        
        thisWidget.setValue(thisWidget.value-1);
        thisWidget.announce();
      });
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        
        thisWidget.setValue(thisWidget.value+1);
        thisWidget.announce();
      });
    }
    announce(){
      const thisWidget = this;
      const event = new CustomEvent('updated', {
        bubbles: true,
      });
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart{
    constructor(element){
      const thisCart = this;
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
      console.log(thisCart);
    }
    getElements(element){
      const thisCart = this;
      thisCart.dom={};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    }
    initActions(){
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      thisCart.dom.productList.addEventListener('updated', function () {
        thisCart.update();
      });
    }
    add(menuProduct){
      const thisCart = this;
      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(generatedDOM);
      thisCart.products.push(new cartProduct(menuProduct, generatedDOM));
      thisCart.update();
    }
    update() {
      const thisCart = this;
      let deliveryFee = settings.cart.defaultDeliveryFee;
      let totalNumber = 0;
      let subtotalPrice = 0;
      for (let product of thisCart.products) {
        totalNumber += product.amount;
        subtotalPrice += product.price;
      }
      if (totalNumber == 0) {
        deliveryFee = 0;
      }
      thisCart.totalPrice = subtotalPrice + deliveryFee;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      for (let price of thisCart.dom.totalPrice) {
        price.innerHTML = thisCart.totalPrice;
      }
      thisCart.dom.totalNumber.innerHTML = totalNumber;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      thisCart.subtotalPrice = subtotalPrice;
    }
    remove(cartProduct) {
      const thisCart = this;
      cartProduct.dom.wrapper.remove();
      const currentIndex = thisCart.products.indexOf(cartProduct);
      thisCart.products.splice(currentIndex, 1);
      thisCart.update();
    }
  }
  class cartProduct{
    constructor(menuProduct,element){
      const thisCartProduct = this;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.params = menuProduct.params;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.getElements(element)
    }
    
  
  getElements(element){
    const thisCartProduct = this;
    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
  }
  initAmountWidget(){
    const thisCartProduct = this;
    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
    thisCartProduct.dom.amountWidget.addEventListener('updated', function (){
      thisCartProduct.price = thisCartProduct.dom.input.value * thisCartProduct.priceSingle;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    })
  }
  remove(){
    const thisCartProduct = this;
    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });
    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }
  initActions() {
    const thisCartProduct = this;
    thisCartProduct.dom.edit.addEventListener('click', function (event) {
      event.preventDefault();
    });
    thisCartProduct.dom.remove.addEventListener('click', function (event) {
      event.preventDefault();
      thisCartProduct.remove();
    });
  }
}
  const app = {
    initMenu: function(){
      const thisApp = this;
      
      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      app.initMenu();
    },
    initCart: function(){
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
  };

  app.init();
  app.initCart();
}
