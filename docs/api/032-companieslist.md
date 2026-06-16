# companies.list

> Source: https://developer.focus.teamleader.eu/docs/api/companies-list

  * [](/)
  * [API Reference](/docs/api)
  * CRM
  * [Companies](/docs/api/companies)
  * companies.list



# companies.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/companies.list

Get a list of companies.

## Request​

  * application/json



### Body

**filter** object

**email** object

**type** stringrequired

**Possible values:** [`primary`]

**Example:**`user`

**email** stringrequired

**Example:**`info@piedpiper.eu`

**ids** string[]

**term** string

Filters on name, vat number, emails and telephones

**Example:**`Acme`

**updated_since** string

**Example:**`2016-02-04T16:44:33+00:00`

**tags** string[]

Filters on tag names

**vat_number** string

**Example:**`BE 0899.623.035`

**national_identification_number** string

**Example:**`63326426`

**status** string

**Possible values:** [`active`, `deactivated`]

**Example:**`active`

**marketing_mails_consent** boolean

**Example:**`false`

**page** object

**size** number

**Default value:**`20`

**number** number

**Default value:**`1`

**sort** object[]

  * Array [

**field** stringrequired

**Possible values:** [`name`, `added_at`, `updated_at`]

**order** Order (string)

**Possible values:** [`asc`, `desc`]

  * ]

**includes** string

Comma-separated list of optional includes

**Example:**`custom_fields,price_list`




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

**Example:**`96a38bbf-24ed-4083-8a5c-20db92aa471e`

**name** string

**Example:**`Pied Piper`

**status** string

**Possible values:** [`active`, `deactivated`]

**Example:**`active`

**business_type** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`businessType`

**vat_number** string

**Example:**`BE0899623035`

**national_identification_number** string

**Example:**`63326426`

**emails** object[]

  * Array [

**type** string

**Possible values:** [`primary`, `invoicing`]

**Example:**`primary`

**email** string

**Example:**`info@piedpiper.eu`

  * ]

**telephones** object[]

  * Array [

**type** stringrequired

**Possible values:** [`phone`, `fax`]

**Example:**`phone`

**number** stringrequired

**Example:**`092980615`

  * ]

**website** string

**Example:**`https://piedpiper.com`

**primary_address** object

**line_1** stringnullable

**Example:**`Dok Noord 3A 101`

**postal_code** stringnullable

**Example:**`9000`

**city** stringnullable

**Example:**`Ghent`

**country** string

**Example:**`BE`

**area_level_two** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`area_level_two`

**iban** string

**Example:**`BE12123412341234`

**bic** string

**Example:**`BICBANK`

**language** string

**Example:**`nl`

**preferred_currency** stringnullable

**Example:**`EUR`

**payment_term** objectnullable

**type** string

**Possible values:** [`cash`, `end_of_month`, `after_invoice_date`]

**days** number

Modifier "X" for the above statements. Not required when type is 'cash'.

**invoicing_preferences** object

**electronic_invoicing_address** stringnullable

**responsible_user** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**added_at** string

**Example:**`2016-02-04T16:44:33+00:00`

**updated_at** string

**Example:**`2016-02-05T16:44:33+00:00`

**web_url** string

**Example:**`https://focus.teamleader.eu/company_detail.php?id=96a38bbf-24ed-4083-8a5c-20db92aa471e`

**tags** string[]

**marketing_mails_consent** boolean

**Example:**`false`

**custom_fields** object[]

Only included with request parameter `includes=custom_fields`

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

**price_list** object

Only included with request parameter `includes=price_list`

**type** string

**Example:**`priceList`

**id** string

**Example:**`27261187-19c9-081f-b833-021fa5873129`

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "96a38bbf-24ed-4083-8a5c-20db92aa471e",  
          "name": "Pied Piper",  
          "status": "active",  
          "business_type": {  
            "type": "businessType",  
            "id": "fd48d4a3-b9dc-4eac-8071-5889c9f21e5d"  
          },  
          "vat_number": "BE0899623035",  
          "national_identification_number": "63326426",  
          "emails": [  
            {  
              "type": "primary",  
              "email": "info@piedpiper.eu"  
            }  
          ],  
          "telephones": [  
            {  
              "type": "phone",  
              "number": "092980615"  
            }  
          ],  
          "website": "https://piedpiper.com",  
          "primary_address": {  
            "line_1": "Dok Noord 3A 101",  
            "postal_code": "9000",  
            "city": "Ghent",  
            "country": "BE",  
            "area_level_two": {  
              "type": "area_level_two",  
              "id": "db232cf8-ad4a-024b-941f-15a7a74f0fd2"  
            }  
          },  
          "iban": "BE12123412341234",  
          "bic": "BICBANK",  
          "language": "nl",  
          "preferred_currency": "EUR",  
          "payment_term": {  
            "type": "cash"  
          },  
          "invoicing_preferences": {  
            "electronic_invoicing_address": null  
          },  
          "responsible_user": {  
            "type": "user",  
            "id": "9b99d8f8-183b-4c7b-8354-9b98b47a192e"  
          },  
          "marketing_mails_consent": false,  
          "added_at": "2016-02-04T16:44:33+00:00",  
          "updated_at": "2016-02-05T16:44:33+00:00",  
          "web_url": "https://focus.teamleader.eu/company_detail.php?id=96a38bbf-24ed-4083-8a5c-20db92aa471e",  
          "tags": [  
            "prospect",  
            "expo"  
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
          "price_list": {  
            "type": "priceList",  
            "id": "5a37d173-78d3-05f3-b018-d51fadc1c5d2"  
          }  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "96a38bbf-24ed-4083-8a5c-20db92aa471e",  
          "name": "Pied Piper",  
          "status": "active",  
          "business_type": {  
            "type": "businessType",  
            "id": "fd48d4a3-b9dc-4eac-8071-5889c9f21e5d"  
          },  
          "vat_number": "BE0899623035",  
          "national_identification_number": "63326426",  
          "emails": [  
            {  
              "type": "primary",  
              "email": "info@piedpiper.eu"  
            }  
          ],  
          "telephones": [  
            {  
              "type": "phone",  
              "number": "092980615"  
            }  
          ],  
          "website": "https://piedpiper.com",  
          "primary_address": {  
            "line_1": "Dok Noord 3A 101",  
            "postal_code": "9000",  
            "city": "Ghent",  
            "country": "BE",  
            "area_level_two": {  
              "type": "area_level_two",  
              "id": "db232cf8-ad4a-024b-941f-15a7a74f0fd2"  
            }  
          },  
          "iban": "BE12123412341234",  
          "bic": "BICBANK",  
          "language": "nl",  
          "preferred_currency": "EUR",  
          "payment_term": {  
            "type": "cash"  
          },  
          "invoicing_preferences": {  
            "electronic_invoicing_address": null  
          },  
          "responsible_user": {  
            "type": "user",  
            "id": "9b99d8f8-183b-4c7b-8354-9b98b47a192e"  
          },  
          "marketing_mails_consent": false,  
          "added_at": "2016-02-04T16:44:33+00:00",  
          "updated_at": "2016-02-05T16:44:33+00:00",  
          "web_url": "https://focus.teamleader.eu/company_detail.php?id=96a38bbf-24ed-4083-8a5c-20db92aa471e",  
          "tags": [  
            "prospect",  
            "expo"  
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
          "price_list": {  
            "type": "priceList",  
            "id": "5a37d173-78d3-05f3-b018-d51fadc1c5d2"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/companies.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"email\": {\n      \"type\": \"primary\",\n      \"email\": \"info@piedpiper.eu\"\n    },\n    \"ids\": [\n      \"cb8da52a-ce89-4bf6-8f7e-8ee6cb85e3b5\",\n      \"f8a57a6f-dd1e-41a3-b8d3-428663f1d09e\"\n    ],\n    \"term\": \"Acme\",\n    \"updated_since\": \"2016-02-04T16:44:33+00:00\",\n    \"tags\": [\n      \"expo\",\n      \"lead\"\n    ],\n    \"vat_number\": \"BE 0899.623.035\",\n    \"national_identification_number\": \"63326426\",\n    \"status\": \"active\"\n  },\n  \"page\": {\n    \"size\": 20,\n    \"number\": 1\n  },\n  \"sort\": [\n    {\n      \"field\": \"name\"\n    }\n  ],\n  \"includes\": \"custom_fields,price_list\"\n}", null, "application/json");  
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
        "email": {
          "type": "primary",
          "email": "info@piedpiper.eu"
        },
        "ids": [
          "cb8da52a-ce89-4bf6-8f7e-8ee6cb85e3b5",
          "f8a57a6f-dd1e-41a3-b8d3-428663f1d09e"
        ],
        "term": "Acme",
        "updated_since": "2016-02-04T16:44:33+00:00",
        "tags": [
          "expo",
          "lead"
        ],
        "vat_number": "BE 0899.623.035",
        "national_identification_number": "63326426",
        "status": "active"
      },
      "page": {
        "size": 20,
        "number": 1
      },
      "sort": [
        {
          "field": "name"
        }
      ],
      "includes": "custom_fields,price_list"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
