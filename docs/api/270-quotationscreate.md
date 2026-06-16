# quotations.create

> Source: https://developer.focus.teamleader.eu/docs/api/quotations-create

  * [](/)
  * [API Reference](/docs/api)
  * Deals
  * [Quotations](/docs/api/quotations)
  * quotations.create



# quotations.create
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/quotations.create

Create a quotation.

## Request​

  * application/json



### Body**required**

**deal_id** stringrequired

**Example:**`cef01135-7e51-4f6f-a6eb-6e5e5a885ac8`

**currency** object

**code** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**exchange_rate** number

**Example:**`1.1238`

**grouped_lines** object[]

A quotation needs `grouped_lines` and/or `text` to be valid

  * Array [

**section** object

**title** stringrequired

**line_items** object[]required

  * Array [

**quantity** numberrequired

**Example:**`3`

**description** stringrequired

**Example:**`An awesome product`

**extended_description** string

Uses Markdown formatting

**Example:**`Some more information about this awesome product`

**unit_of_measure_id** stringnullable

**Example:**`f79d3e04-b8dc-0637-8f18-ca7c8fc63b71`

**unit_price** objectrequired

**amount** numberrequired

**Example:**`123.3`

**tax** stringrequired

**Possible values:** [`excluding`]

**Example:**`excluding`

**tax_rate_id** stringrequired

**Example:**`c0c03f1e-77e3-402c-a713-30ea1c585823`

**discount** object

**value** numberrequired

**Example:**`10`

**type** stringrequired

Values between 0 and 100

**Possible values:** [`percentage`]

**Example:**`percentage`

**product_id** string

This is purely informational and does not affect the quotation besides adding a reference to the product

**Example:**`e2314517-3cab-4aa9-8471-450e73449041`

**purchase_price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**periodicity** objectnullable

oneOf

    * By Week
    * By Month
    * By Year

**unit** stringrequired

**Possible values:** [`week`]

**Example:**`week`

**period** numberrequired

**Possible values:** [`1`, `2`]

**Example:**`2`

**unit** stringrequired

**Possible values:** [`month`]

**Example:**`month`

**period** numberrequired

**Possible values:** [`1`, `2`, `3`, `4`, `6`]

**Example:**`4`

**unit** stringrequired

**Possible values:** [`year`]

**Example:**`year`

**period** numberrequired

**Possible values:** [`1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`]

**Example:**`7`

  * ]

  * ]

**discounts** object[]

  * Array [

**type** string

Values between 0 and 100

**Possible values:** [`percentage`]

**Example:**`percentage`

**value** number

**Example:**`15.5`

**description** string

**Example:**`winter promotion`

  * ]

**text** string

Uses Markdown formatting. A quotation needs `grouped_lines` and/or `text` to be valid

**Example:**`Quotation text`

**document_template_id** string

**Example:**`179e1564-493b-4305-8c54-a34fc80920fc`

**expiry** object

Only available if user has access to quotation expiry.

**expires_after** stringnullable

**Example:**`2023-04-05`

**action_after_expiry** stringrequired

**Possible values:** [`lock`, `none`]




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
        "type": "quotation",  
        "id": "e4bf74ca-e900-471f-84b1-276e5d3afae4"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "quotation",  
        "id": "e4bf74ca-e900-471f-84b1-276e5d3afae4"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/quotations.create");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"deal_id\": \"cef01135-7e51-4f6f-a6eb-6e5e5a885ac8\",\n  \"currency\": {\n    \"code\": \"EUR\",\n    \"exchange_rate\": 1.1238\n  },\n  \"grouped_lines\": [\n    {\n      \"section\": {\n        \"title\": \"\"\n      },\n      \"line_items\": [\n        {\n          \"quantity\": 3,\n          \"description\": \"An awesome product\",\n          \"extended_description\": \"Some more information about this awesome product\",\n          \"unit_of_measure_id\": \"f79d3e04-b8dc-0637-8f18-ca7c8fc63b71\",\n          \"unit_price\": {\n            \"amount\": 123.3,\n            \"tax\": \"excluding\"\n          },\n          \"tax_rate_id\": \"c0c03f1e-77e3-402c-a713-30ea1c585823\",\n          \"discount\": {\n            \"value\": 10,\n            \"type\": \"percentage\"\n          },\n          \"product_id\": \"d905ff57-e866-0f59-9d1e-1fd4538bfae1\",\n          \"purchase_price\": {\n            \"amount\": 123.3,\n            \"currency\": \"EUR\"\n          },\n          \"periodicity\": {\n            \"unit\": \"week\",\n            \"period\": 2\n          }\n        }\n      ]\n    }\n  ],\n  \"discounts\": [\n    {\n      \"type\": \"percentage\",\n      \"value\": 15.5,\n      \"description\": \"winter promotion\"\n    }\n  ],\n  \"text\": \"Quotation text\",\n  \"document_template_id\": \"179e1564-493b-4305-8c54-a34fc80920fc\",\n  \"expiry\": {\n    \"expires_after\": \"2023-04-05\",\n    \"action_after_expiry\": \"lock\"\n  }\n}", null, "application/json");  
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
      "deal_id": "cef01135-7e51-4f6f-a6eb-6e5e5a885ac8",
      "currency": {
        "code": "EUR",
        "exchange_rate": 1.1238
      },
      "grouped_lines": [
        {
          "section": {
            "title": ""
          },
          "line_items": [
            {
              "quantity": 3,
              "description": "An awesome product",
              "extended_description": "Some more information about this awesome product",
              "unit_of_measure_id": "f79d3e04-b8dc-0637-8f18-ca7c8fc63b71",
              "unit_price": {
                "amount": 123.3,
                "tax": "excluding"
              },
              "tax_rate_id": "c0c03f1e-77e3-402c-a713-30ea1c585823",
              "discount": {
                "value": 10,
                "type": "percentage"
              },
              "product_id": "d905ff57-e866-0f59-9d1e-1fd4538bfae1",
              "purchase_price": {
                "amount": 123.3,
                "currency": "EUR"
              },
              "periodicity": {
                "unit": "week",
                "period": 2
              }
            }
          ]
        }
      ],
      "discounts": [
        {
          "type": "percentage",
          "value": 15.5,
          "description": "winter promotion"
        }
      ],
      "text": "Quotation text",
      "document_template_id": "179e1564-493b-4305-8c54-a34fc80920fc",
      "expiry": {
        "expires_after": "2023-04-05",
        "action_after_expiry": "lock"
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
