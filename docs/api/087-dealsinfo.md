# deals.info

> Source: https://developer.focus.teamleader.eu/docs/api/deals-info

  * [](/)
  * [API Reference](/docs/api)
  * Deals
  * [Deals](/docs/api/deals)
  * deals.info



# deals.info
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/deals.info

Get details for a single deal.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`f6871b06-6513-4750-b5e6-ff3503b5a029`




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

**Example:**`f6871b06-6513-4750-b5e6-ff3503b5a029`

**title** string

**Example:**`Interesting deal`

**summary** stringnullable

**Example:**`Additional information`

**reference** string

**Example:**`2017/2`

**status** string

**Possible values:** [`open`, `won`, `lost`]

**Example:**`won`

**lead** object

**customer** object

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**contact_person** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**department** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**estimated_value** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**estimated_closing_date** string

**Example:**`2017-05-09`

**estimated_probability** number

**Example:**`0.5`

**weighted_value** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**purchase_order_number** stringnullable

**Example:**`000023`

**current_phase** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**responsible_user** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**closed_at** string

**Example:**`2017-05-09T11:31:30+00:00`

**source** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**phase_history** object[]

  * Array [

**phase** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**started_at** string

**Example:**`2017-05-01 12:00:00`

**started_by** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

  * ]

**quotations** object[]

  * Array [

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

  * ]

**lost_reason** objectnullable

**reason** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**remark** stringnullable

**Example:**`Too expensive`

**created_at** string

**Example:**`2017-05-09T11:25:11+00:00`

**updated_at** string

**Example:**`2017-05-09T11:30:58+00:00`

**web_url** string

**Example:**`https://focus.teamleader.eu/sale_detail.php?id=f6871b06-6513-4750-b5e6-ff3503b5a029`

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

**currency_exchange_rate** object

**from** CurrencyCode (string)

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**Example:**`USD`

**to** CurrencyCode (string)

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**Example:**`EUR`

**rate** number

**Example:**`1.1234`

**pipeline** object

**type** string

**Example:**`dealPipeline`

**id** string

**Example:**`4e81f3c4-7dca-44cb-b126-6158bec392a2`



    
    
    {  
      "data": {  
        "id": "f6871b06-6513-4750-b5e6-ff3503b5a029",  
        "title": "Interesting deal",  
        "summary": "Additional information",  
        "reference": "2017/2",  
        "status": "won",  
        "lead": {  
          "customer": {  
            "type": "company",  
            "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"  
          },  
          "contact_person": {  
            "type": "contact",  
            "id": "74c6769e-815a-4774-87d7-dfab9b1a0abb"  
          }  
        },  
        "department": {  
          "type": "department",  
          "id": "92247818-643e-4f5a-bf87-25cd908e8ad9"  
        },  
        "estimated_value": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "estimated_closing_date": "2017-05-09",  
        "estimated_probability": 0.5,  
        "weighted_value": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "purchase_order_number": "000023",  
        "current_phase": {  
          "type": "dealPhase",  
          "id": "676a6070-f7d3-43a6-bc08-cda0d32c27ab"  
        },  
        "responsible_user": {  
          "type": "user",  
          "id": "4e81f3c4-7dca-44cb-b126-6158bec392a2"  
        },  
        "closed_at": "2017-05-09T11:31:30+00:00",  
        "source": {  
          "type": "dealSource",  
          "id": "aba0ad66-bf59-49fa-b546-45dcbc5e7e6e"  
        },  
        "phase_history": [  
          {  
            "phase": {  
              "type": "dealPhase",  
              "id": "d5a629f2-7b58-4748-aaca-acf9b6d62404"  
            },  
            "started_at": "2017-05-01 12:00:00",  
            "started_by": {  
              "type": "user",  
              "id": "4ec55a8c-2d80-472a-a9c2-5ff5ee7eac6a"  
            }  
          }  
        ],  
        "quotations": [  
          {  
            "id": "e2314517-3cab-4aa9-8471-450e73449041",  
            "type": "quotation"  
          }  
        ],  
        "lost_reason": {  
          "reason": {  
            "type": "lostReason",  
            "id": "4e81f3c4-7dca-44cb-b126-6158bec392a2"  
          },  
          "remark": "Too expensive"  
        },  
        "created_at": "2017-05-09T11:25:11+00:00",  
        "updated_at": "2017-05-09T11:30:58+00:00",  
        "web_url": "https://focus.teamleader.eu/sale_detail.php?id=f6871b06-6513-4750-b5e6-ff3503b5a029",  
        "custom_fields": [  
          {  
            "definition": {  
              "type": "customFieldDefinition",  
              "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1"  
            },  
            "value": "092980616"  
          }  
        ],  
        "currency_exchange_rate": {  
          "from": "USD",  
          "to": "EUR",  
          "rate": 1.1234  
        },  
        "pipeline": {  
          "type": "dealPipeline",  
          "id": "4e81f3c4-7dca-44cb-b126-6158bec392a2"  
        }  
      }  
    }  
    
    
    
    {  
      "data": {  
        "id": "f6871b06-6513-4750-b5e6-ff3503b5a029",  
        "title": "Interesting deal",  
        "summary": "Additional information",  
        "reference": "2017/2",  
        "status": "won",  
        "lead": {  
          "customer": {  
            "type": "company",  
            "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"  
          },  
          "contact_person": {  
            "type": "contact",  
            "id": "74c6769e-815a-4774-87d7-dfab9b1a0abb"  
          }  
        },  
        "department": {  
          "type": "department",  
          "id": "92247818-643e-4f5a-bf87-25cd908e8ad9"  
        },  
        "estimated_value": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "estimated_closing_date": "2017-05-09",  
        "estimated_probability": 0.5,  
        "weighted_value": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "purchase_order_number": "000023",  
        "current_phase": {  
          "type": "dealPhase",  
          "id": "676a6070-f7d3-43a6-bc08-cda0d32c27ab"  
        },  
        "responsible_user": {  
          "type": "user",  
          "id": "4e81f3c4-7dca-44cb-b126-6158bec392a2"  
        },  
        "closed_at": "2017-05-09T11:31:30+00:00",  
        "source": {  
          "type": "dealSource",  
          "id": "aba0ad66-bf59-49fa-b546-45dcbc5e7e6e"  
        },  
        "phase_history": [  
          {  
            "phase": {  
              "type": "dealPhase",  
              "id": "d5a629f2-7b58-4748-aaca-acf9b6d62404"  
            },  
            "started_at": "2017-05-01 12:00:00",  
            "started_by": {  
              "type": "user",  
              "id": "4ec55a8c-2d80-472a-a9c2-5ff5ee7eac6a"  
            }  
          }  
        ],  
        "quotations": [  
          {  
            "id": "e2314517-3cab-4aa9-8471-450e73449041",  
            "type": "quotation"  
          }  
        ],  
        "lost_reason": {  
          "reason": {  
            "type": "lostReason",  
            "id": "4e81f3c4-7dca-44cb-b126-6158bec392a2"  
          },  
          "remark": "Too expensive"  
        },  
        "created_at": "2017-05-09T11:25:11+00:00",  
        "updated_at": "2017-05-09T11:30:58+00:00",  
        "web_url": "https://focus.teamleader.eu/sale_detail.php?id=f6871b06-6513-4750-b5e6-ff3503b5a029",  
        "custom_fields": [  
          {  
            "definition": {  
              "type": "customFieldDefinition",  
              "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1"  
            },  
            "value": "092980616"  
          }  
        ],  
        "currency_exchange_rate": {  
          "from": "USD",  
          "to": "EUR",  
          "rate": 1.1234  
        },  
        "pipeline": {  
          "type": "dealPipeline",  
          "id": "4e81f3c4-7dca-44cb-b126-6158bec392a2"  
        }  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/deals.info");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"f6871b06-6513-4750-b5e6-ff3503b5a029\"\n}", null, "application/json");  
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
      "id": "f6871b06-6513-4750-b5e6-ff3503b5a029"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
