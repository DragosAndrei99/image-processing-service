import { ClusterService } from "./clusterize/clusterize.service";
import { bootstrap } from "./server";

const clusterService: ClusterService = new ClusterService();

clusterService.clusterize(bootstrap);
