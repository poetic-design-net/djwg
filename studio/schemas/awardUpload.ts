export default {
  name: 'awardUpload',
  title: 'Award Uploads',
  type: 'document',
  fields: [
    {
      name: 'userId',
      title: 'Benutzer ID',
      type: 'string',
      description: 'ID des Benutzers aus Supabase'
    },
    {
      name: 'userName',
      title: 'Benutzername',
      type: 'string'
    },
    {
      name: 'userEmail',
      title: 'E-Mail',
      type: 'string'
    },
    {
      name: 'supabaseId',
      title: 'Supabase ID',
      type: 'string',
      description: 'Referenz zur media_uploads Tabelle in Supabase'
    },
    {
      name: 'originalFilename',
      title: 'Originaler Dateiname',
      type: 'string'
    },
    {
      name: 'fileType',
      title: 'Dateityp',
      type: 'string'
    },
    {
      name: 'fileSize',
      title: 'Dateigröße',
      type: 'number'
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Ausstehend', value: 'pending'},
          {title: 'Überprüft', value: 'reviewed'},
          {title: 'Abgelehnt', value: 'rejected'},
          {title: 'Akzeptiert', value: 'accepted'}
        ]
      }
    },
    {
      name: 'uploadedAt',
      title: 'Hochgeladen am',
      type: 'datetime'
    },
    {
      name: 'lastModified',
      title: 'Zuletzt geändert',
      type: 'datetime'
    },
    {
      name: 'metadata',
      title: 'Metadaten',
      type: 'object',
      fields: [
        {
          name: 'mimeType',
          title: 'MIME Type',
          type: 'string'
        },
        {
          name: 'lastModified',
          title: 'Zuletzt geändert',
          type: 'datetime'
        },
        {
          name: 'fileExtension',
          title: 'Dateiendung',
          type: 'string'
        },
        {
          name: 'uploadSource',
          title: 'Upload Quelle',
          type: 'string'
        },
        {
          name: 'originalSize',
          title: 'Originalgröße',
          type: 'number'
        },
        {
          name: 'dimensions',
          title: 'Dimensionen',
          type: 'object',
          fields: [
            {name: 'width', type: 'number', title: 'Breite'},
            {name: 'height', type: 'number', title: 'Höhe'}
          ]
        }
      ]
    },
    {
      name: 'asset',
      title: 'Asset',
      type: 'object',
      fields: [
        {
          name: 'type',
          title: 'Typ',
          type: 'string'
        },
        {
          name: 'image',
          title: 'Bild',
          type: 'image'
        },
        {
          name: 'file',
          title: 'Datei',
          type: 'file'
        }
      ]
    },
    {
      name: 'awardCategory',
      title: 'Award Kategorie',
      type: 'string',
      options: {
        list: [
          {title: 'DJing', value: 'djing'},
          {title: 'Producing', value: 'producing'},
          {title: 'Performance', value: 'performance'}
        ]
      }
    },
    {
      name: 'juryRating',
      title: 'Jury Bewertung',
      type: 'number',
      // @ts-ignore - Sanity Schema Validation
      validation: rule => rule.min(0).max(10)
    },
    {
      name: 'juryComments',
      title: 'Jury Kommentare',
      type: 'text'
    },
    {
      name: 'isWinner',
      title: 'Ist Gewinner',
      type: 'boolean',
      initialValue: false
    }
  ],
  preview: {
    select: {
      title: 'originalFilename',
      subtitle: 'userName',
      media: 'asset.image'
    }
  }
}