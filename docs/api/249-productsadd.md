# products.add

> Source: https://developer.focus.teamleader.eu/docs/api/products-add

  * [](/)
  * [API Reference](/docs/api)
  * Products
  * [Products](/docs/api/products)
  * products.add



# products.add
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/products.add

Add a new product.

## Request​

  * application/json



### Body**required**

oneOf

    * Add Product by Name
    * Add Product by Code

**name** stringrequired

**Example:**`cookies`

**code** string

**Example:**`COOK-DARKCHOC-42`

**description** string

The description of the product in Markdown

**purchase_price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**selling_price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**unit_of_measure_id** stringnullable

**Example:**`f79d3e04-b8dc-0637-8f18-ca7c8fc63b71`

**price_list_prices** object[]

  * Array [

**price_list_id** stringrequired

**Example:**`d905ff57-e866-0f59-9d1e-1fd4538bfae1`

**price** objectrequired

**amount** numberrequired

**Example:**`100`

**currency** stringrequired

**Example:**`EUR`

  * ]

**stock** object

Only available when stock management feature is enabled

**amount** numbernullable

**Example:**`123`

**configuration** objectnullable

**stock_threshold** objectnullable

Only available when stock management feature is enabled

**minimum** numberrequired

Cannot be negative

**Example:**`4`

**action** stringrequired

**Possible values:** [`notify`]

**Example:**`notify`

**department_id** string

**Example:**`af48fe9e-d44c-0eac-8813-8be051b10921`

**product_category_id** string

**Example:**`624ca743-8998-4f8c-add1-c427bb022166`

**tax_rate_id** string

**Example:**`23097774-e51e-0371-9b42-98ef8ca8bbb6`

**custom_fields** object[]

  * Array [

**id** string

**Example:**`bf6765de-56eb-40ec-ad14-9096c5dc5fe1`

**value** object

oneOf

    * string
    * number
    * multiple selection
    * boolean
    * object

****string

For strings

**Example:**`092980616`

****number

For integer, number, money and auto-increment fields

**Example:**`123`

  * Array [

****string

  * ]

****boolean

For Yes/No fields

**Example:**`true`

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Possible values:** [`company`, `contact`, `product`, `user`]

**Example:**`company`

  * ]

**name** string

**Example:**`cookies`

**code** stringrequired

**Example:**`COOK-DARKCHOC-42`

**description** string

The description of the product in Markdown

**purchase_price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**selling_price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**unit_of_measure_id** stringnullable

**Example:**`f79d3e04-b8dc-0637-8f18-ca7c8fc63b71`

**price_list_prices** object[]

  * Array [

**price_list_id** stringrequired

**Example:**`d905ff57-e866-0f59-9d1e-1fd4538bfae1`

**price** objectrequired

**amount** numberrequired

**Example:**`100`

**currency** stringrequired

**Example:**`EUR`

  * ]

**stock** object

Only available when stock management feature is enabled

**amount** numbernullable

**Example:**`123`

**configuration** objectnullable

**stock_threshold** objectnullable

Only available when stock management feature is enabled

**minimum** numberrequired

Cannot be negative

**Example:**`4`

**action** stringrequired

**Possible values:** [`notify`]

**Example:**`notify`

**department_id** string

**Example:**`af48fe9e-d44c-0eac-8813-8be051b10921`

**product_category_id** string

**Example:**`624ca743-8998-4f8c-add1-c427bb022166`

**tax_rate_id** string

**Example:**`23097774-e51e-0371-9b42-98ef8ca8bbb6`

**custom_fields** object[]

  * Array [

**id** string

**Example:**`bf6765de-56eb-40ec-ad14-9096c5dc5fe1`

**value** object

oneOf

    * string
    * number
    * multiple selection
    * boolean
    * object

****string

For strings

**Example:**`092980616`

****number

For integer, number, money and auto-increment fields

**Example:**`123`

  * Array [

****string

  * ]

****boolean

For Yes/No fields

**Example:**`true`

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Possible values:** [`company`, `contact`, `product`, `user`]

**Example:**`company`

  * ]




## Responses​

  * 201



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string



    
    
    {  
      "data": {  
        "type": "product",  
        "id": "ee94b4c0-5786-0517-9d26-8dd1e6406f20"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "product",  
        "id": "ee94b4c0-5786-0517-9d26-8dd1e6406f20"  
      }  
    }  
    

#### Authorization: http
    
    
    **name:** [httpBearer](/docs/api/teamleader-api#authentication)**type:** http**scheme:** bearer

  * csharp
  * curl
  * dart
  * go
  * http
  * java
  * javascript
  * kotlin
  * c
  * nodejs
  * objective-c
  * ocaml
  * php
  * powershell
  * python
  * r
  * ruby
  * rust
  * shell
  * swift



  * HTTPCLIENT
  * RESTSHARP


    
    
    var client = new HttpClient();  
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/products.add");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"name\": \"cookies\",\n  \"code\": \"COOK-DARKCHOC-42\",\n  \"description\": \"string\",\n  \"purchase_price\": {\n    \"amount\": 123.3,\n    \"currency\": \"BAM\"\n  },\n  \"selling_price\": {\n    \"amount\": 123.3,\n    \"currency\": \"BAM\"\n  },\n  \"unit_of_measure_id\": \"f79d3e04-b8dc-0637-8f18-ca7c8fc63b71\",\n  \"price_list_prices\": [\n    {\n      \"price_list_id\": \"d905ff57-e866-0f59-9d1e-1fd4538bfae1\",\n      \"price\": {\n        \"amount\": 100,\n        \"currency\": \"EUR\"\n      }\n    }\n  ],\n  \"stock\": {\n    \"amount\": 123\n  },\n  \"configuration\": {\n    \"stock_threshold\": {\n      \"minimum\": 4,\n      \"action\": \"notify\"\n    }\n  },\n  \"department_id\": \"af48fe9e-d44c-0eac-8813-8be051b10921\",\n  \"product_category_id\": \"624ca743-8998-4f8c-add1-c427bb022166\",\n  \"tax_rate_id\": \"23097774-e51e-0371-9b42-98ef8ca8bbb6\",\n  \"custom_fields\": [\n    {\n      \"id\": \"bf6765de-56eb-40ec-ad14-9096c5dc5fe1\",\n      \"value\": \"092980616\"\n    }\n  ]\n}", null, "application/json");  
    request.Content = content;  
    var response = await client.SendAsync(request);  
    response.EnsureSuccessStatusCode();  
    Console.WriteLine(await response.Content.ReadAsStringAsync());  
    

Request Collapse all

Base URL

Edit

https://api.focus.teamleader.eu

Auth

Bearer Token

Body required
    
    
    {
      "name": "cookies",
      "code": "COOK-DARKCHOC-42",
      "description": "string",
      "purchase_price": {
        "amount": 123.3,
        "currency": "BAM"
      },
      "selling_price": {
        "amount": 123.3,
        "currency": "BAM"
      },
      "unit_of_measure_id": "f79d3e04-b8dc-0637-8f18-ca7c8fc63b71",
      "price_list_prices": [
        {
          "price_list_id": "d905ff57-e866-0f59-9d1e-1fd4538bfae1",
          "price": {
            "amount": 100,
            "currency": "EUR"
          }
        }
      ],
      "stock": {
        "amount": 123
      },
      "configuration": {
        "stock_threshold": {
          "minimum": 4,
          "action": "notify"
        }
      },
      "department_id": "af48fe9e-d44c-0eac-8813-8be051b10921",
      "product_category_id": "624ca743-8998-4f8c-add1-c427bb022166",
      "tax_rate_id": "23097774-e51e-0371-9b42-98ef8ca8bbb6",
      "custom_fields": [
        {
          "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1",
          "value": "092980616"
        }
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
