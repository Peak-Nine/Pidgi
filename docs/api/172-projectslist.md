# projects.list

> Source: https://developer.focus.teamleader.eu/docs/api/legacy-projects-list

  * [](/)
  * [API Reference](/docs/api)
  * Legacy Projects
  * [Legacy Projects](/docs/api/legacy-projects)
  * projects.list



# projects.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects.list

Get a list of projects.

## Request​

  * application/json



### Body

**filter** object

**customer** object

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**status** string

**Possible values:** [`active`, `on_hold`, `done`, `cancelled`]

**participant_id** string

**Example:**`ed544eac-02e4-037b-8a1a-c8dd662bf621`

**term** string

Searches for a term in title or description

**Example:**`coffee`

**updated_since** string

**Example:**`2020-06-04T16:44:33+00:00`

**page** object

**size** number

**Default value:**`20`

**number** number

**Default value:**`1`

**sort** object[]

  * Array [

**field** stringrequired

**Possible values:** [`due_on`, `title`, `created_at`]

**Default value:**`due_on`

**order** Order (string)

**Possible values:** [`asc`, `desc`]

**Default value:**`asc`

  * ]




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

**Example:**`624ca743-8998-4f8c-add1-c427bb022166`

**reference** string

**Example:**`PRO-2`

**title** string

**Example:**`New company website`

**description** string

**status** string

**Possible values:** [`active`, `on_hold`, `done`, `cancelled`]

**customer** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**starts_on** string

**Example:**`2016-02-04`

**due_on** string

**Example:**`2016-10-14`

**created_at** string

**Example:**`2016-02-01T11:25:41+00:00`

**source** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

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

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "624ca743-8998-4f8c-add1-c427bb022166",  
          "reference": "PRO-2",  
          "title": "New company website",  
          "description": "",  
          "status": "active",  
          "customer": {  
            "type": "contact",  
            "id": "abbf02c0-8ff9-4048-b83f-5195035161e1"  
          },  
          "starts_on": "2016-02-04",  
          "due_on": "2016-10-14",  
          "created_at": "2016-02-01T11:25:41+00:00",  
          "source": {  
            "type": "deal",  
            "id": "5023d7c2-80d7-4d4b-b2bd-0fcaa6a1f069"  
          },  
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
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "624ca743-8998-4f8c-add1-c427bb022166",  
          "reference": "PRO-2",  
          "title": "New company website",  
          "description": "",  
          "status": "active",  
          "customer": {  
            "type": "contact",  
            "id": "abbf02c0-8ff9-4048-b83f-5195035161e1"  
          },  
          "starts_on": "2016-02-04",  
          "due_on": "2016-10-14",  
          "created_at": "2016-02-01T11:25:41+00:00",  
          "source": {  
            "type": "deal",  
            "id": "5023d7c2-80d7-4d4b-b2bd-0fcaa6a1f069"  
          },  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"customer\": {\n      \"type\": \"company\",\n      \"id\": \"ebafa4c5-fa8a-4409-92e5-1b192243372f\"\n    },\n    \"participant_id\": \"ed544eac-02e4-037b-8a1a-c8dd662bf621\",\n    \"term\": \"coffee\",\n    \"updated_since\": \"2020-06-04T16:44:33+00:00\"\n  },\n  \"page\": {\n    \"size\": 20,\n    \"number\": 1\n  },\n  \"sort\": [\n    {\n      \"field\": \"due_on\"\n    }\n  ]\n}", null, "application/json");  
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
        "customer": {
          "type": "company",
          "id": "ebafa4c5-fa8a-4409-92e5-1b192243372f"
        },
        "participant_id": "ed544eac-02e4-037b-8a1a-c8dd662bf621",
        "term": "coffee",
        "updated_since": "2020-06-04T16:44:33+00:00"
      },
      "page": {
        "size": 20,
        "number": 1
      },
      "sort": [
        {
          "field": "due_on"
        }
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
