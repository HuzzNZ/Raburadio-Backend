import { albumModel, artistModel, memberModel, songModel } from "../db.js"
import { dateScalar } from "./schemas.js";

export const resolvers = {
    Date: dateScalar,
    Query: {
        getAllMembers: async (parent, args) => {
            return memberModel.find()
        },
        getAllArtists: async (parent, args) => {
            return artistModel.find()
        },
        getAllAlbums: async (parent, args) => {
            return albumModel.find().sort({ releaseDate: args.sort? 1 : -1 }).limit(args.limit)
        },
        getAllSongs: async (parent, args) => {
            return songModel.find()
        },
        getAllSongsInAlbum: async (parent, args) => {
            return songModel.find({ albumId: args.albumId }).sort({ albumOrder: 1 })
        },

        getMemberById: async (parent, args) => {
            return memberModel.findById(args.id);
        },
        getArtistById: async (parent, args) => {
            return artistModel.findById(args.id);
        },
        getAlbumById: async (parent, args) => {
            return albumModel.findById(args.id);
        },
        getSongById: async (parent, args) => {
            return songModel.findById(args.id);
        },

        findSongsByName: async (parent, args) => {
            const rgx = new RegExp(`.*${args.name}.*`);
            const filter = {
                $and: [
                    {
                        $or: [
                            {titleRom: {$regex: rgx, $options: "i"}},
                            {titleNat: {$regex: rgx, $options: "i"}}
                        ]
                    },
                    { isInstrumental: args.includeInstrumental? { $exists: true } : false },
                    { isRadioDrama: args.includeRadioDrama? { $exists: true } : false }
                ]
            }
            return songModel.find(filter).sort({releaseDate: args.sort? 1 : -1}).limit(args.limit);
        },

        findSongsByArtist: async (parent, args) => {
            const songFilter = {
                $and: [
                    { artists: args.artistId },
                    { isInstrumental: args.includeInstrumental? { $exists: true } : false },
                    { isRadioDrama: args.includeRadioDrama? { $exists: true } : false }
                ]
            }
            let songArray = await songModel.find(songFilter).populate('albumId')
            songArray.sort((first, second) => {
                return ((args.sort? 1 : -1)*Number(first.albumId.releaseDate) + (args.sort? -1 : 1)*Number(second.albumId.releaseDate))
            })
            return songArray.slice(0, args.limit)
        },
    },
    Artist: {
        members: async (parent) => {
            let member_array = []
            for (let member of parent.members) {
                member_array.push( new Promise ((resolve, reject) => {
                    memberModel.findById(member, (err, document) => {
                        if (err) reject(err);
                        else resolve(document)
                    })
                }))
            }
            return member_array
        }
    },
    Song: {
        inAlbum: async (parent) => {
            let filter = {
                _id: parent.albumId
            }
            return albumModel.findOne(filter);
        },
        artists: async (parent) => {
            return getArtists(parent)
        }
    },
    Album: {
        artists: async (parent) => {
            return getArtists(parent)
        },
        songs: async (parent) => {
            return songModel.find({albumId: parent.id});
        }
    }
}

const getArtists = (parent) => {
    if (parent.artists) {
        let artist_array = []
        for (let artist of parent.artists) {
            artist_array.push( new Promise ((resolve, reject) => {
                artistModel.findById(artist, (err, document) => {
                    if (err) reject(err);
                    else resolve(document)
                })
            }))
        }
        return artist_array
    } else {
        return []
    }
}
