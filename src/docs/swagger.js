const bearer = [{ bearerAuth: [] }];
const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'string' } };
const json = (props, required = []) => ({
  required: true,
  content: { 'application/json': { schema: { type: 'object', required, properties: props } } },
});
const s = { type: 'string' };

module.exports = {
  openapi: '3.0.0',
  info: { title: 'TuneStream API', version: '1.0.0', description: 'Music streaming backend' },
  servers: [{ url: '/' }],
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
  paths: {
    '/api/auth/register': { post: { tags: ['Auth'], summary: 'Register', requestBody: json({ name: s, email: s, password: s, role: { type: 'string', enum: ['listener', 'artist'] } }, ['name', 'email', 'password']), responses: { 201: { description: 'Created + JWT' } } } },
    '/api/auth/login': { post: { tags: ['Auth'], summary: 'Login', requestBody: json({ email: s, password: s }, ['email', 'password']), responses: { 200: { description: 'JWT' } } } },
    '/api/auth/firebase': { post: { tags: ['Auth'], summary: 'Exchange Firebase ID token for JWT', requestBody: json({ idToken: s, role: s }, ['idToken']), responses: { 200: { description: 'JWT' } } } },
    '/api/auth/me': { get: { tags: ['Auth'], summary: 'Current user', security: bearer, responses: { 200: { description: 'OK' } } } },

    '/api/tracks': {
      get: { tags: ['Tracks'], summary: 'List tracks (pagination, ?genre=, ?artist=)', security: bearer, parameters: [{ name: 'page', in: 'query', schema: { type: 'integer' } }, { name: 'limit', in: 'query', schema: { type: 'integer' } }, { name: 'genre', in: 'query', schema: s }], responses: { 200: { description: 'OK' } } },
      post: { tags: ['Tracks'], summary: 'Upload a track (artist only)', security: bearer, requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', required: ['audio', 'title', 'genre'], properties: { audio: { type: 'string', format: 'binary' }, title: s, genre: s, album: s, duration: { type: 'number' }, coverUrl: s } } } } }, responses: { 201: { description: 'Created' } } },
    },
    '/api/tracks/search': { get: { tags: ['Tracks'], summary: 'Search by genre/title/album', security: bearer, parameters: [{ name: 'q', in: 'query', required: true, schema: s }], responses: { 200: { description: 'OK' } } } },
    '/api/tracks/{id}': {
      get: { tags: ['Tracks'], summary: 'Get track', security: bearer, parameters: [idParam], responses: { 200: { description: 'OK' } } },
      put: { tags: ['Tracks'], summary: 'Update own track', security: bearer, parameters: [idParam], requestBody: json({ title: s, genre: s, album: s }), responses: { 200: { description: 'OK' } } },
      delete: { tags: ['Tracks'], summary: 'Delete own track', security: bearer, parameters: [idParam], responses: { 200: { description: 'Deleted' } } },
    },
    '/api/tracks/{id}/stream': { get: { tags: ['Tracks'], summary: 'Stream track (counts a play, redirects to audio)', security: bearer, parameters: [idParam], responses: { 302: { description: 'Redirect to audio file' } } } },

    '/api/playlists': {
      get: { tags: ['Playlists'], summary: 'My playlists + public playlists', security: bearer, responses: { 200: { description: 'OK' } } },
      post: { tags: ['Playlists'], summary: 'Create playlist', security: bearer, requestBody: json({ name: s, description: s, isPublic: { type: 'boolean' }, tracks: { type: 'array', items: s } }, ['name']), responses: { 201: { description: 'Created' } } },
    },
    '/api/playlists/{id}': {
      get: { tags: ['Playlists'], summary: 'Get playlist with tracks', security: bearer, parameters: [idParam], responses: { 200: { description: 'OK' } } },
      put: { tags: ['Playlists'], summary: 'Update playlist', security: bearer, parameters: [idParam], requestBody: json({ name: s, description: s, isPublic: { type: 'boolean' } }), responses: { 200: { description: 'OK' } } },
      delete: { tags: ['Playlists'], summary: 'Delete playlist', security: bearer, parameters: [idParam], responses: { 200: { description: 'Deleted' } } },
    },
    '/api/playlists/{id}/tracks': { post: { tags: ['Playlists'], summary: 'Add track to playlist', security: bearer, parameters: [idParam], requestBody: json({ trackId: s }, ['trackId']), responses: { 201: { description: 'Added' } } } },
    '/api/playlists/{id}/tracks/{trackId}': { delete: { tags: ['Playlists'], summary: 'Remove track from playlist', security: bearer, parameters: [idParam, { name: 'trackId', in: 'path', required: true, schema: s }], responses: { 200: { description: 'Removed' } } } },

    '/api/artists': { get: { tags: ['Artists'], summary: 'List artists', security: bearer, responses: { 200: { description: 'OK' } } } },
    '/api/artists/me/dashboard': { get: { tags: ['Artists'], summary: 'Artist dashboard stats (artist only)', security: bearer, responses: { 200: { description: 'OK' } } } },
    '/api/artists/{id}': { get: { tags: ['Artists'], summary: 'Artist profile + tracks', security: bearer, parameters: [idParam], responses: { 200: { description: 'OK' } } } },

    '/api/recommendations': { get: { tags: ['Extras'], summary: 'Recommended tracks', security: bearer, responses: { 200: { description: 'OK' } } } },
    '/api/offline/tracks': { get: { tags: ['Extras'], summary: 'Offline mock tracks (no DB needed)', parameters: [{ name: 'q', in: 'query', schema: s }], responses: { 200: { description: 'OK' } } } },
  },
};
