# milestones.info

> Source: https://developer.focus.teamleader.eu/docs/api/legacy-milestones-info

  * [](/)
  * [API Reference](/docs/api)
  * Legacy Projects
  * [Legacy Milestones](/docs/api/legacy-milestones)
  * milestones.info



# milestones.info
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/milestones.info

Get details for a single milestone.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`64349fa2-6ca2-4b19-82e6-d3258ceab2d8`




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

**Example:**`64349fa2-6ca2-4b19-82e6-d3258ceab2d8`

**project** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**starts_on** stringnullable

**Example:**`2017-01-01`

**due_on** string

**Example:**`2018-01-01`

**name** string

**Example:**`Initial setup`

**description** string

**responsible_user** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**status** string

**Possible values:** [`open`, `closed`]

**invoicing_method** string

**Possible values:** [`time_and_materials`, `fixed_price`, `non_invoiceable`]

**Example:**`time_and_materials`

**depends_on** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**dependency_for** object[]

  * Array [

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

  * ]

**actuals** object

Only accessible for administrators of the project this milestone belongs to

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

**budget** object

Only accessible for administrators of the project this milestone belongs to

**provided** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**spent** object

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

A prediction of the spent budget upon milestone completion. This is null if there is not enough data to calculate

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

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



    
    
    {  
      "data": {  
        "id": "64349fa2-6ca2-4b19-82e6-d3258ceab2d8",  
        "project": {  
          "type": "project",  
          "id": "fffaf951-b65a-4cb1-bfb6-4b93e0e60c10"  
        },  
        "starts_on": "2017-01-01",  
        "due_on": "2018-01-01",  
        "name": "Initial setup",  
        "description": "",  
        "responsible_user": {  
          "type": "user",  
          "id": "e1240972-6cfc-4549-b49c-edda7568cc48"  
        },  
        "status": "open",  
        "invoicing_method": "time_and_materials",  
        "depends_on": {  
          "type": "milestone",  
          "id": "0488d792-ba9b-059f-bd57-bea75d3f4f4e"  
        },  
        "dependency_for": [  
          {  
            "type": "milestone",  
            "id": "b71ff11f-074e-0705-9450-589342af4f4f"  
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
          }  
        },  
        "budget": {  
          "provided": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "spent": {  
            "amount": 123.3,  
            "currency": "EUR"  
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
        },  
        "custom_fields": [  
          {  
            "definition": {  
              "type": "customFieldDefinition",  
              "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1"  
            },  
            "value": "092980616"  
          }  
        ]  
      }  
    }  
    
    
    
    {  
      "data": {  
        "id": "64349fa2-6ca2-4b19-82e6-d3258ceab2d8",  
        "project": {  
          "type": "project",  
          "id": "fffaf951-b65a-4cb1-bfb6-4b93e0e60c10"  
        },  
        "starts_on": "2017-01-01",  
        "due_on": "2018-01-01",  
        "name": "Initial setup",  
        "description": "",  
        "responsible_user": {  
          "type": "user",  
          "id": "e1240972-6cfc-4549-b49c-edda7568cc48"  
        },  
        "status": "open",  
        "invoicing_method": "time_and_materials",  
        "depends_on": {  
          "type": "milestone",  
          "id": "0488d792-ba9b-059f-bd57-bea75d3f4f4e"  
        },  
        "dependency_for": [  
          {  
            "type": "milestone",  
            "id": "b71ff11f-074e-0705-9450-589342af4f4f"  
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
          }  
        },  
        "budget": {  
          "provided": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "spent": {  
            "amount": 123.3,  
            "currency": "EUR"  
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
        },  
        "custom_fields": [  
          {  
            "definition": {  
              "type": "customFieldDefinition",  
              "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1"  
            },  
            "value": "092980616"  
          }  
        ]  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/milestones.info");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"64349fa2-6ca2-4b19-82e6-d3258ceab2d8\"\n}", null, "application/json");  
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
      "id": "64349fa2-6ca2-4b19-82e6-d3258ceab2d8"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
