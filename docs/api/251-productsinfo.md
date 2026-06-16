# products.info

> Source: https://developer.focus.teamleader.eu/docs/api/products-info

  * [](/)
  * [API Reference](/docs/api)
  * Products
  * [Products](/docs/api/products)
  * products.info



# products.info
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/products.info

Get details for a single product.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`6fac0bf0-e803-424e-af67-76863a3d7d16`

**includes** string

Comma-separated list of optional includes

**Example:**`suppliers`




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**id** string

**Example:**`f8ae61ec-62f3-0538-b028-185c4a5f217f`

**name** stringnullable

**Example:**`cookies`

**description** stringnullable

The description of the product in Markdown

**Example:**`dark chocolate`

**code** stringnullable

**Example:**`COOK-DARKCHOC-42`

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

**unit** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**tax** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**suppliers** object[]

Only included with request parameter `includes=suppliers`

  * Array [

**supplier** object

**type** string

**Possible values:** [`company`, `contact`]

**Example:**`contact`

**id** string

**Example:**`e2314517-3cab-4aa9-8471-450e73449040`

**purchase_price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**product_code** string

**Example:**`prod-111`

**minimum_order_amount** number

**Example:**`3`

**classification** string

**Possible values:** [`primary`, `secondary`]

  * ]

**custom_fields** object[]

  * Array [

**definition** object

**type** string

**Example:**`customFieldDefinition`

**id** string

**Example:**`bf6765de-56eb-40ec-ad14-9096c5dc5fe1`

**value** object

oneOf

    * string
    * numbers
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

For multiple selection fields

**Example:**`foo`

  * ]

****boolean

For Yes/No fields

**Example:**`true`

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

For related Teamleader objects

**Possible values:** [`company`, `contact`, `product`, `user`]

**Example:**`company`

  * ]

**price_list_prices** array[]

**product_category** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**stock** object

Only available when stock management feature is enabled

**amount** numbernullable

**Example:**`123`

**configuration** objectnullable

**stock_threshold** objectnullable

Only available when stock management feature is enabled

**minimum** number

**Example:**`4`

**action** string

**Possible values:** [`notify`]

**Example:**`notify`

**added_at** string

**Example:**`2016-02-01T11:25:41+00:00`

**updated_at** string

**Example:**`2016-02-01T11:25:41+00:00`



    
    
    {  
      "data": {  
        "id": "f8ae61ec-62f3-0538-b028-185c4a5f217f",  
        "name": "cookies",  
        "description": "dark chocolate",  
        "code": "COOK-DARKCHOC-42",  
        "purchase_price": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "selling_price": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "unit": {  
          "type": "unitOfMeasure",  
          "id": "f79d3e04-b8dc-0637-8f18-ca7c8fc63b71"  
        },  
        "tax": {  
          "type": "taxRate",  
          "id": "df444ced-3129-0916-8f40-07ae5832bf98"  
        },  
        "suppliers": [  
          {  
            "supplier": {  
              "type": "contact",  
              "id": "e2314517-3cab-4aa9-8471-450e73449040"  
            },  
            "purchase_price": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "product_code": "prod-111",  
            "minimum_order_amount": 3,  
            "classification": "primary"  
          }  
        ],  
        "custom_fields": [  
          {  
            "definition": {  
              "type": "customFieldDefinition",  
              "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1"  
            },  
            "value": "092980616"  
          }  
        ],  
        "price_list_prices": [  
          {  
            "price_list": {  
              "id": "d905ff57-e866-0f59-9d1e-1fd4538bfae1",  
              "type": "priceList"  
            },  
            "price": {  
              "amount": 100,  
              "currency": "EUR"  
            }  
          }  
        ],  
        "product_category": {  
          "type": "productCategory",  
          "id": "e2314517-3cab-4aa9-8471-450e73449041"  
        },  
        "stock": {  
          "amount": 123  
        },  
        "configuration": {  
          "stock_threshold": {  
            "minimum": 4,  
            "action": "notify"  
          }  
        },  
        "added_at": "2016-02-01T11:25:41+00:00",  
        "updated_at": "2016-02-01T11:25:41+00:00"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "id": "f8ae61ec-62f3-0538-b028-185c4a5f217f",  
        "name": "cookies",  
        "description": "dark chocolate",  
        "code": "COOK-DARKCHOC-42",  
        "purchase_price": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "selling_price": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "unit": {  
          "type": "unitOfMeasure",  
          "id": "f79d3e04-b8dc-0637-8f18-ca7c8fc63b71"  
        },  
        "tax": {  
          "type": "taxRate",  
          "id": "df444ced-3129-0916-8f40-07ae5832bf98"  
        },  
        "suppliers": [  
          {  
            "supplier": {  
              "type": "contact",  
              "id": "e2314517-3cab-4aa9-8471-450e73449040"  
            },  
            "purchase_price": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "product_code": "prod-111",  
            "minimum_order_amount": 3,  
            "classification": "primary"  
          }  
        ],  
        "custom_fields": [  
          {  
            "definition": {  
              "type": "customFieldDefinition",  
              "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1"  
            },  
            "value": "092980616"  
          }  
        ],  
        "price_list_prices": [  
          {  
            "price_list": {  
              "id": "d905ff57-e866-0f59-9d1e-1fd4538bfae1",  
              "type": "priceList"  
            },  
            "price": {  
              "amount": 100,  
              "currency": "EUR"  
            }  
          }  
        ],  
        "product_category": {  
          "type": "productCategory",  
          "id": "e2314517-3cab-4aa9-8471-450e73449041"  
        },  
        "stock": {  
          "amount": 123  
        },  
        "configuration": {  
          "stock_threshold": {  
            "minimum": 4,  
            "action": "notify"  
          }  
        },  
        "added_at": "2016-02-01T11:25:41+00:00",  
        "updated_at": "2016-02-01T11:25:41+00:00"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/products.info");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"f8ae61ec-62f3-0538-b028-185c4a5f217f\",\n  \"includes\": \"suppliers\"\n}", null, "application/json");  
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
      "id": "f8ae61ec-62f3-0538-b028-185c4a5f217f",
      "includes": "suppliers"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
