# projects.info

> Source: https://developer.focus.teamleader.eu/docs/api/nextgen-projects-info

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * [Projects](/docs/api/projects)
  * projects.info



# projects.info
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects-v2/projects.info

Returns all the information of a single project.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`0184f276-811b-716d-8b79-17628c9573c6`

**includes** string

Comma-separated list of optional includes

**Example:**`legacy_project`




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

**Example:**`49b403be-a32e-0901-9b1c-25214f9027c6`

**project_key** number

Positive, sequential integer representing the index of the project for the account

**Example:**`123`

**title** string

**Example:**`My project title`

**description** stringnullable

**Example:**`My project description`

**status** string

**Possible values:** [`open`, `closed`]

**update_rights** string

**Possible values:** [`owners`, `owners_and_assignees`, `everyone`]

**Example:**`owners`

**billing_method** string

**Possible values:** [`time_and_materials`, `fixed_price`, `non_billable`]

**Example:**`time_and_materials`

**time_budget** objectnullable

Value in seconds, rounded to the nearest minute

**value** number

**Example:**`60`

**unit** string

**Possible values:** [`seconds`]

**Example:**`seconds`

**time_tracked** objectnullable

**value** number

**Example:**`60`

**unit** string

**Possible values:** [`seconds`]

**Example:**`seconds`

**amount_billed** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**fixed_amount_billed** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**amount_paid** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**external_budget** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**task_external_budget_spent** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**material_external_budget_spent** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**external_budget_spent** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**internal_budget** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**fixed_price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**calculated_price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**cost** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**margin** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**margin_percentage** numbernullable

`null` if the user does not have access to "Costs on projects"

**start_date** stringnullable

**Example:**`2022-02-23`

**end_date** stringnullable

**Example:**`2022-02-28`

**purchase_order_number** stringnullable

**Example:**`000023`

**company_entity** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**owners** object[]

  * Array [

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

  * ]

**color** Color (string)

**Possible values:** [`#00B2B2`, `#008A8C`, `#992600`, `#ED9E00`, `#D157D3`, `#A400B2`, `#0071F2`, `#004DA6`, `#64788F`, `#C0C0C4`, `#82828C`, `#1A1C20`]

**Example:**`#00B2B2`

**assignees** object[]

  * Array [

**assignee** object

**type** string

**Possible values:** [`team`, `user`]

**Example:**`user`

**id** string

**Example:**`66abace2-62af-0836-a927-fe3f44b9b47b`

**assign_type** string

**Possible values:** [`manual`, `auto_assigned`, `manual_and_auto_assigned`]

**Example:**`auto_assigned`

  * ]

**customers** object[]

  * Array [

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

  * ]

**deals** object[]

  * Array [

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

**custom_user_rates** object[]

  * Array [

**user** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**custom_rate** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

  * ]

**custom_fields** object[]

Auto-increment custom fields are not supported on projects.

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

**legacy_project** objectnullable

Only included if `legacy_project` is in the optional includes. `null` if there is no corresponding legacy project

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`project`

**external_parties** object[]

  * Array [

**id** string

**Example:**`e80e3e0f-4008-47cc-aa94-3d71a42052bf`

**customer** object

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**function** string

**Example:**`Sales representative`

**sub_function** string

**Example:**`Teamleader Focus FR`

  * ]



    
    
    {  
      "data": {  
        "id": "49b403be-a32e-0901-9b1c-25214f9027c6",  
        "project_key": 123,  
        "title": "My project title",  
        "description": "My project description",  
        "status": "open",  
        "update_rights": "owners",  
        "billing_method": "time_and_materials",  
        "time_budget": {  
          "value": 43200,  
          "unit": "seconds"  
        },  
        "time_tracked": {  
          "value": 43200,  
          "unit": "seconds"  
        },  
        "amount_billed": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "fixed_amount_billed": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "amount_paid": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "external_budget": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "task_external_budget_spent": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "material_external_budget_spent": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "external_budget_spent": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "internal_budget": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "price": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "fixed_price": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "calculated_price": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "cost": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "margin": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "margin_percentage": null,  
        "start_date": "2022-02-23",  
        "end_date": "2022-02-28",  
        "purchase_order_number": "000023",  
        "company_entity": {  
          "type": "department",  
          "id": "0d0dec5a-7096-4009-be37-07eab117db07"  
        },  
        "owners": [  
          {  
            "type": "user",  
            "id": "66abace2-62af-0836-a927-fe3f44b9b47b"  
          }  
        ],  
        "color": "#00B2B2",  
        "assignees": [  
          {  
            "assignee": {  
              "type": "user",  
              "id": "66abace2-62af-0836-a927-fe3f44b9b47b"  
            },  
            "assign_type": "auto_assigned"  
          }  
        ],  
        "customers": [  
          {  
            "type": "contact",  
            "id": "1106f231-0464-41b7-8b0b-19451af81afe"  
          }  
        ],  
        "deals": [  
          {  
            "type": "deal",  
            "id": "66abace2-62af-0836-a927-fe3f44b9b47b"  
          }  
        ],  
        "quotations": [  
          {  
            "type": "quotation",  
            "id": "a7f15c40-3b65-09ae-9f1b-d55786bc7b01"  
          }  
        ],  
        "custom_user_rates": [  
          {  
            "user": {  
              "type": "user",  
              "id": "55d3707c-14dc-4b62-a072-e3f4c1413462"  
            },  
            "custom_rate": {  
              "amount": 123.3,  
              "currency": "EUR"  
            }  
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
        "legacy_project": {  
          "type": "project",  
          "id": "624ca743-8998-4f8c-add1-c427bb022166"  
        },  
        "external_parties": {  
          "id": "f7fcf4eb-583c-4e6b-88be-2a9e83afdb81",  
          "customer": {  
            "type": "contact",  
            "id": "66abace2-62af-0836-a927-fe3f44b9b47b"  
          },  
          "function": "Sales representative",  
          "sub_function": "Teamleader Focus FR"  
        }  
      }  
    }  
    
    
    
    {  
      "data": {  
        "id": "49b403be-a32e-0901-9b1c-25214f9027c6",  
        "project_key": 123,  
        "title": "My project title",  
        "description": "My project description",  
        "status": "open",  
        "update_rights": "owners",  
        "billing_method": "time_and_materials",  
        "time_budget": {  
          "value": 43200,  
          "unit": "seconds"  
        },  
        "time_tracked": {  
          "value": 43200,  
          "unit": "seconds"  
        },  
        "amount_billed": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "fixed_amount_billed": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "amount_paid": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "external_budget": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "task_external_budget_spent": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "material_external_budget_spent": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "external_budget_spent": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "internal_budget": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "price": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "fixed_price": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "calculated_price": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "cost": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "margin": {  
          "amount": 123.3,  
          "currency": "EUR"  
        },  
        "margin_percentage": null,  
        "start_date": "2022-02-23",  
        "end_date": "2022-02-28",  
        "purchase_order_number": "000023",  
        "company_entity": {  
          "type": "department",  
          "id": "0d0dec5a-7096-4009-be37-07eab117db07"  
        },  
        "owners": [  
          {  
            "type": "user",  
            "id": "66abace2-62af-0836-a927-fe3f44b9b47b"  
          }  
        ],  
        "color": "#00B2B2",  
        "assignees": [  
          {  
            "assignee": {  
              "type": "user",  
              "id": "66abace2-62af-0836-a927-fe3f44b9b47b"  
            },  
            "assign_type": "auto_assigned"  
          }  
        ],  
        "customers": [  
          {  
            "type": "contact",  
            "id": "1106f231-0464-41b7-8b0b-19451af81afe"  
          }  
        ],  
        "deals": [  
          {  
            "type": "deal",  
            "id": "66abace2-62af-0836-a927-fe3f44b9b47b"  
          }  
        ],  
        "quotations": [  
          {  
            "type": "quotation",  
            "id": "a7f15c40-3b65-09ae-9f1b-d55786bc7b01"  
          }  
        ],  
        "custom_user_rates": [  
          {  
            "user": {  
              "type": "user",  
              "id": "55d3707c-14dc-4b62-a072-e3f4c1413462"  
            },  
            "custom_rate": {  
              "amount": 123.3,  
              "currency": "EUR"  
            }  
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
        "legacy_project": {  
          "type": "project",  
          "id": "624ca743-8998-4f8c-add1-c427bb022166"  
        },  
        "external_parties": [  
          {  
            "id": "f7fcf4eb-583c-4e6b-88be-2a9e83afdb81",  
            "customer": {  
              "type": "contact",  
              "id": "66abace2-62af-0836-a927-fe3f44b9b47b"  
            },  
            "function": "Sales representative",  
            "sub_function": "Teamleader Focus FR"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects-v2/projects.info");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"0184f276-811b-716d-8b79-17628c9573c6\",\n  \"includes\": \"legacy_project\"\n}", null, "application/json");  
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
      "id": "0184f276-811b-716d-8b79-17628c9573c6",
      "includes": "legacy_project"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
