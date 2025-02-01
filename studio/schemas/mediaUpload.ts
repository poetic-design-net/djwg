export default {
  name: 'mediaUpload',
  title: 'Media Upload',
  type: 'document',
  fields: [
    // User Information
    {
      name: 'userName',
      title: 'User Name',
      type: 'string',
      description: 'Name des Upload-Users'
    },
    {
      name: 'userEmail',
      title: 'User Email',
      type: 'string',
      description: 'Email des Upload-Users'
    },
    {
      name: 'userId',
      title: 'User ID',
      type: 'string',
      description: 'Supabase User ID'
    },
    {
      name: 'supabaseId',
      title: 'Supabase ID',
      type: 'string',
      description: 'Referenz zur media_uploads Tabelle'
    },

    // File Information
    {
      name: 'originalFilename',
      title: 'Original Filename',
      type: 'string'
    },
    {
      name: 'fileType',
      title: 'File Type',
      type: 'string'
    },
    {
      name: 'fileSize',
      title: 'File Size',
      type: 'number'
    },
    {
      name: 'asset',
      title: 'Asset',
      type: 'object',
      fields: [
        {
          name: 'type',
          title: 'Asset Type',
          type: 'string',
          options: {
            list: [
              {title: 'Image', value: 'image'},
              {title: 'File', value: 'file'}
            ]
          }
        },
        {
          name: 'image',
          title: 'Image',
          type: 'image',
          hidden: ({parent}: {parent: {type?: string}}) => parent?.type !== 'image'
        },
        {
          name: 'file',
          title: 'File',
          type: 'file',
          hidden: ({parent}: {parent: {type?: string}}) => parent?.type !== 'file'
        }
      ]
    },

    // Timestamps
    {
      name: 'uploadedAt',
      title: 'Uploaded At',
      type: 'datetime'
    },
    {
      name: 'lastModified',
      title: 'Last Modified',
      type: 'datetime'
    },

    // Status & Review
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Pending', value: 'pending'},
          {title: 'Approved', value: 'approved'},
          {title: 'Rejected', value: 'rejected'}
        ]
      }
    },
    {
      name: 'reviewStatus',
      title: 'Review Status',
      type: 'string',
      options: {
        list: [
          {title: 'Pending Review', value: 'pending'},
          {title: 'Under Review', value: 'reviewing'},
          {title: 'Reviewed', value: 'reviewed'}
        ]
      }
    },
    {
      name: 'reviewedBy',
      title: 'Reviewed By',
      type: 'string'
    },
    {
      name: 'reviewedAt',
      title: 'Reviewed At',
      type: 'datetime'
    },
    {
      name: 'adminNotes',
      title: 'Admin Notes',
      type: 'text'
    },

    // Enhanced Metadata
    {
      name: 'metadata',
      title: 'Metadata',
      type: 'object',
      fields: [
        {
          name: 'mimeType',
          title: 'MIME Type',
          type: 'string'
        },
        {
          name: 'lastModified',
          title: 'Last Modified',
          type: 'datetime'
        },
        {
          name: 'fileExtension',
          title: 'File Extension',
          type: 'string'
        },
        {
          name: 'uploadSource',
          title: 'Upload Source',
          type: 'string'
        },
        {
          name: 'originalSize',
          title: 'Original Size',
          type: 'number'
        },
        {
          name: 'dimensions',
          title: 'Dimensions',
          type: 'object',
          fields: [
            {name: 'width', type: 'number'},
            {name: 'height', type: 'number'}
          ]
        }
      ]
    },

    // Security
    {
      name: 'isPublic',
      title: 'Is Public',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'hasRestrictions',
      title: 'Has Restrictions',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'allowedUsers',
      title: 'Allowed Users',
      type: 'array',
      of: [{type: 'string'}]
    },

    // Versioning
    {
      name: 'version',
      title: 'Version',
      type: 'number',
      initialValue: 1
    },
    {
      name: 'previousVersions',
      title: 'Previous Versions',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {name: 'versionNumber', type: 'number'},
          {name: 'fileUrl', type: 'string'},
          {name: 'modifiedAt', type: 'datetime'},
          {name: 'modifiedBy', type: 'string'}
        ]
      }]
    }
  ],
  preview: {
    select: {
      title: 'originalFilename',
      subtitle: 'userName',
      assetType: 'asset.type',
      imageAsset: 'asset.image',
      fileAsset: 'asset.file'
    },
    prepare(selection: {
      title: string;
      subtitle: string;
      assetType: string;
      imageAsset: any;
      fileAsset: any;
    }) {
      const { title, subtitle, assetType, imageAsset, fileAsset } = selection;
      return {
        title,
        subtitle,
        media: assetType === 'image' ? imageAsset : fileAsset
      };
    }
  },
  orderings: [
    {
      title: 'Upload Date, New',
      name: 'uploadedAtDesc',
      by: [
        {field: 'uploadedAt', direction: 'desc'}
      ]
    },
    {
      title: 'File Size, Large',
      name: 'fileSizeDesc',
      by: [
        {field: 'fileSize', direction: 'desc'}
      ]
    }
  ]
}