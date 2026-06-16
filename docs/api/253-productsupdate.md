# products.update

> Source: https://developer.focus.teamleader.eu/docs/api/products-update

  * [](/)
  * [API Reference](/docs/api)
  * Products
  * [Products](/docs/api/products)
  * products.update



# products.update
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/products.update

Update a product.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`71e91f91-b222-033f-8c7e-59bcc1521e3d`

**name** stringnullable

**Example:**`Hosting`

**code** stringnullable

**Example:**`c0d32`

**purchase_price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**description** stringnullable

**Example:**`Product used for hosting web solutions`

**selling_price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**unit_of_measure_id** stringnullable

**Example:**`f79d3e04-b8dc-0637-8f18-ca7c8fc63b71`

**price_list_prices** array[]

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

  * 204



**Response Headers**




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/products.update");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"71e91f91-b222-033f-8c7e-59bcc1521e3d\",\n  \"name\": \"Hosting\",\n  \"code\": \"c0d32\",\n  \"purchase_price\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"description\": \"Product used for hosting web solutions\",\n  \"selling_price\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"unit_of_measure_id\": \"f79d3e04-b8dc-0637-8f18-ca7c8fc63b71\",\n  \"price_list_prices\": [\n    {\n      \"price_list_id\": \"d905ff57-e866-0f59-9d1e-1fd4538bfae1\",\n      \"price\": {\n        \"amount\": 100,\n        \"currency\": \"EUR\"\n      }\n    }\n  ],\n  \"stock\": {\n    \"amount\": 123\n  },\n  \"configuration\": {\n    \"stock_threshold\": {\n      \"minimum\": 4,\n      \"action\": \"notify\"\n    }\n  },\n  \"department_id\": \"af48fe9e-d44c-0eac-8813-8be051b10921\",\n  \"product_category_id\": \"624ca743-8998-4f8c-add1-c427bb022166\",\n  \"tax_rate_id\": \"23097774-e51e-0371-9b42-98ef8ca8bbb6\",\n  \"custom_fields\": [\n    {\n      \"id\": \"bf6765de-56eb-40ec-ad14-9096c5dc5fe1\",\n      \"value\": \"092980616\"\n    }\n  ]\n}", null, "application/json");  
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

  * Example (from schema)
  * Example


    
    
    {
      "id": "71e91f91-b222-033f-8c7e-59bcc1521e3d",
      "name": "Hosting",
      "code": "c0d32",
      "purchase_price": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "description": "Product used for hosting web solutions",
      "selling_price": {
        "amount": 123.3,
        "currency": "EUR"
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
