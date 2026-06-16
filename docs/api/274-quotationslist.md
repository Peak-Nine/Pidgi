# quotations.list

> Source: https://developer.focus.teamleader.eu/docs/api/quotations-list

  * [](/)
  * [API Reference](/docs/api)
  * Deals
  * [Quotations](/docs/api/quotations)
  * quotations.list



# quotations.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/quotations.list

Get a list of quotations.

## Request​

  * application/json



### Body

**filter** object

**ids** string[]

**page** object

**size** number

**Default value:**`20`

**number** number

**Default value:**`1`




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object[]

  * Array [

**id** string

**Example:**`5b16f6ee-e302-0079-901b-50c26c4a55b1`

**deal** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**currency_exchange_rate** object

**from** CurrencyCode (string)

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**Example:**`USD`

**to** CurrencyCode (string)

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**Example:**`EUR`

**rate** number

**Example:**`1.1234`

**total** object

**tax_exclusive** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**tax_inclusive** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**taxes** object[]

  * Array [

**rate** number

**Example:**`0.21`

**taxable** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**tax** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

  * ]

**purchase_price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**created_at** stringnullable

**Example:**`2017-05-09T11:25:11+00:00`

**updated_at** stringnullable

**Example:**`2017-05-09T11:30:58+00:00`

**status** string

**Possible values:** [`open`, `accepted`, `expired`, `rejected`, `closed`]

**Example:**`open`

**name** string

**Example:**`Webdevelopment`

**expiry** object

returned if user has access to quotation expiry and `includes=expiry` is requested

**expires_after** string

**Example:**`2023-04-05`

**action_after_expiry** string

**Possible values:** [`lock`, `none`]

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "5b16f6ee-e302-0079-901b-50c26c4a55b1",  
          "deal": {  
            "type": "deal",  
            "id": "53474a7a-f9b2-4dd4-88a8-40ce773c7a64"  
          },  
          "currency_exchange_rate": {  
            "from": "USD",  
            "to": "EUR",  
            "rate": 1.1234  
          },  
          "total": {  
            "tax_exclusive": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "tax_inclusive": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "taxes": [  
              {  
                "rate": 0.21,  
                "taxable": {  
                  "amount": 123.3,  
                  "currency": "EUR"  
                },  
                "tax": {  
                  "amount": 123.3,  
                  "currency": "EUR"  
                }  
              }  
            ],  
            "purchase_price": {  
              "amount": 123.3,  
              "currency": "EUR"  
            }  
          },  
          "created_at": "2017-05-09T11:25:11+00:00",  
          "updated_at": "2017-05-09T11:30:58+00:00",  
          "status": "open",  
          "name": "Webdevelopment",  
          "expiry": {  
            "expires_after": "2023-04-05",  
            "action_after_expiry": "lock"  
          }  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "5b16f6ee-e302-0079-901b-50c26c4a55b1",  
          "deal": {  
            "type": "deal",  
            "id": "53474a7a-f9b2-4dd4-88a8-40ce773c7a64"  
          },  
          "currency_exchange_rate": {  
            "from": "USD",  
            "to": "EUR",  
            "rate": 1.1234  
          },  
          "total": {  
            "tax_exclusive": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "tax_inclusive": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "taxes": [  
              {  
                "rate": 0.21,  
                "taxable": {  
                  "amount": 123.3,  
                  "currency": "EUR"  
                },  
                "tax": {  
                  "amount": 123.3,  
                  "currency": "EUR"  
                }  
              }  
            ],  
            "purchase_price": {  
              "amount": 123.3,  
              "currency": "EUR"  
            }  
          },  
          "created_at": "2017-05-09T11:25:11+00:00",  
          "updated_at": "2017-05-09T11:30:58+00:00",  
          "status": "open",  
          "name": "Webdevelopment",  
          "expiry": {  
            "expires_after": "2023-04-05",  
            "action_after_expiry": "lock"  
          }  
        }  
      ]  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/quotations.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"ids\": [\n      \"5b16f6ee-e302-0079-901b-50c26c4a55b1\",\n      \"2700006a-b351-070b-b311-fb45ed99abe2\"\n    ]\n  },\n  \"page\": {\n    \"size\": 20,\n    \"number\": 1\n  }\n}", null, "application/json");  
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

Body

  * Example (from schema)
  * Example


    
    
    {
      "filter": {
        "ids": [
          "5b16f6ee-e302-0079-901b-50c26c4a55b1",
          "2700006a-b351-070b-b311-fb45ed99abe2"
        ]
      },
      "page": {
        "size": 20,
        "number": 1
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
