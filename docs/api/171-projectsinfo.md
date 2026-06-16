# projects.info

> Source: https://developer.focus.teamleader.eu/docs/api/legacy-projects-info

  * [](/)
  * [API Reference](/docs/api)
  * Legacy Projects
  * [Legacy Projects](/docs/api/legacy-projects)
  * projects.info



# projects.info
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects.info

Get details for a single project.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`8a04371b-2ffb-407b-9b24-d5b5452009c7`




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

**Example:**`8a04371b-2ffb-407b-9b24-d5b5452009c7`

**reference** string

**Example:**`PRO-1`

**title** string

**Example:**`New company website`

**description** string

**status** string

**Possible values:** [`active`, `on_hold`, `done`, `cancelled`]

**customer** object

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**starts_on** string

**Example:**`2016-02-04`

**due_on** string

**Example:**`2016-02-04`

**source** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**milestones** object[]

  * Array [

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

  * ]

**participants** object[]

  * Array [

**participant** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Possible values:** [`user`]

**Example:**`user`

**role** Role (string)

**Possible values:** [`decision_maker`, `member`]

  * ]

**purchase_order_number** stringnullable

**Example:**`000023`

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

**actuals** object

Only accessible for administrators of this project

**billable_amount** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**costs** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**result** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**profit_percentage** number

**budget** object

Only accessible for administrators of this project

**provided** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**spent** object

**total** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**time** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**materials** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**remaining** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**allocated** objectnullable

The amount of money still expected to be spent. This is null if there is not enough data to calculate

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**forecasted** objectnullable

A prediction of the spent budget upon project completion. This is null if there is not enough data to calculate

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]



    
    
    {  
      "data": {  
        "id": "8a04371b-2ffb-407b-9b24-d5b5452009c7",  
        "reference": "PRO-1",  
        "title": "New company website",  
        "description": "",  
        "status": "active",  
        "customer": {  
          "type": "contact",  
          "id": "de41d3e8-808f-4279-b6ff-4706b04c8df2"  
        },  
        "starts_on": "2016-02-04",  
        "due_on": "2016-02-04",  
        "source": {  
          "type": "deal",  
          "id": "39abbf9e-9692-4cca-b20d-79577890752c"  
        },  
        "milestones": [  
          {  
            "type": "milestone",  
            "id": "7c6b5e26-3068-47a6-bf3b-431d7ab7e704"  
          }  
        ],  
        "participants": [  
          {  
            "participant": {  
              "type": "user",  
              "id": "b0ef899b-143c-4708-90ce-aecb3350e116"  
            },  
            "role": "decision_maker"  
          }  
        ],  
        "purchase_order_number": "000023",  
        "custom_fields": [  
          {  
            "definition": {  
              "type": "customFieldDefinition",  
              "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1"  
            },  
            "value": "092980616"  
          }  
        ],  
        "actuals": {  
          "billable_amount": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "costs": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "result": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "profit_percentage": 0  
        },  
        "budget": {  
          "provided": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "spent": {  
            "total": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "time": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "materials": {  
              "amount": 123.3,  
              "currency": "EUR"  
            }  
          },  
          "remaining": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "allocated": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "forecasted": {  
            "amount": 123.3,  
            "currency": "EUR"  
          }  
        }  
      }  
    }  
    
    
    
    {  
      "data": {  
        "id": "8a04371b-2ffb-407b-9b24-d5b5452009c7",  
        "reference": "PRO-1",  
        "title": "New company website",  
        "description": "",  
        "status": "active",  
        "customer": {  
          "type": "contact",  
          "id": "de41d3e8-808f-4279-b6ff-4706b04c8df2"  
        },  
        "starts_on": "2016-02-04",  
        "due_on": "2016-02-04",  
        "source": {  
          "type": "deal",  
          "id": "39abbf9e-9692-4cca-b20d-79577890752c"  
        },  
        "milestones": [  
          {  
            "type": "milestone",  
            "id": "7c6b5e26-3068-47a6-bf3b-431d7ab7e704"  
          }  
        ],  
        "participants": [  
          {  
            "participant": {  
              "type": "user",  
              "id": "b0ef899b-143c-4708-90ce-aecb3350e116"  
            },  
            "role": "decision_maker"  
          }  
        ],  
        "purchase_order_number": "000023",  
        "custom_fields": [  
          {  
            "definition": {  
              "type": "customFieldDefinition",  
              "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1"  
            },  
            "value": "092980616"  
          }  
        ],  
        "actuals": {  
          "billable_amount": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "costs": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "result": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "profit_percentage": 0  
        },  
        "budget": {  
          "provided": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "spent": {  
            "total": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "time": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "materials": {  
              "amount": 123.3,  
              "currency": "EUR"  
            }  
          },  
          "remaining": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "allocated": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "forecasted": {  
            "amount": 123.3,  
            "currency": "EUR"  
          }  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects.info");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"8a04371b-2ffb-407b-9b24-d5b5452009c7\"\n}", null, "application/json");  
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
      "id": "8a04371b-2ffb-407b-9b24-d5b5452009c7"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
